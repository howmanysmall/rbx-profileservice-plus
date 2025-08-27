--!optimize 2
--!strict

local fs = require("@lune/fs")
local process = require("@lune/process")

local NodePath = {}

local PATH_SEPARATOR = if process.os == "windows" then "\\" else "/"
local PATH_SEPARATOR_BYTE = (string.byte(PATH_SEPARATOR))

local function Join(...: string): string
	return table.concat({...}, PATH_SEPARATOR)
end
NodePath.Join = Join

local function SmartSplit(path: string): {string}
	local segments = {}
	local length = 0
	local start = 1
	local size = #path

	for index = 1, size do
		if (string.byte(path, index)) == 47 then
			if index > start then
				length += 1
				segments[length] = string.sub(path, start, index - 1)
			end
			start = index + 1
		end
	end

	if start <= size then
		length += 1
		segments[length] = string.sub(path, start)
	end

	return segments
end

local function NewStringArray(size: number): {string}
	return (table.create(size) :: unknown) :: {string}
end

local function Normalize(pathToNormalize: string?): string
	if pathToNormalize == nil or #pathToNormalize == 0 then
		return "."
	end

	pathToNormalize = (string.gsub(pathToNormalize, "[\\/]", "/"))
	local isAbsolute = (string.byte(pathToNormalize, 1)) == PATH_SEPARATOR_BYTE
	local parts = SmartSplit(pathToNormalize)

	local resolved = NewStringArray(#parts)
	local length = 0

	for _, component in parts do
		if component == ".." then
			if length > 0 and resolved[length] ~= ".." then
				resolved[length] = nil
				length -= 1
			elseif not isAbsolute then
				length += 1
				resolved[length] = ".."
			end
		elseif component ~= "." then
			length += 1
			resolved[length] = component
		end
	end

	local resolvedPath = table.concat(resolved, PATH_SEPARATOR)
	if isAbsolute then
		resolvedPath = PATH_SEPARATOR .. resolvedPath
	end

	if #resolvedPath == 0 then
		return if isAbsolute then PATH_SEPARATOR else "."
	end

	return resolvedPath
end
NodePath.Normalize = Normalize

local function Resolve(...: string): string
	local size = (select("#", ...))
	local isAbsolute = false
	local stack = NewStringArray(size)
	local length = 0

	for index = 1, size do
		local segment = (select(index, ...))
		if (string.byte(segment, 1, 1)) == PATH_SEPARATOR_BYTE then
			-- If this segment is absolute, restart from root
			isAbsolute = true
			table.clear(stack)
			length = 0
		end

		for _, part in SmartSplit(segment) do
			if part == "." then
				continue
			end

			if part == ".." then
				if length > 0 then
					stack[length] = nil
					length -= 1
				elseif not isAbsolute then
					length += 1
					stack[length] = ".."
				end
			else
				length += 1
				stack[length] = part
			end
		end
	end

	local prefix = if isAbsolute then PATH_SEPARATOR else ""
	local result = `{prefix}{table.concat(stack, PATH_SEPARATOR)}`

	local subTernary = if isAbsolute then PATH_SEPARATOR else "."
	return if result == "" then subTernary else Normalize(result)
end
NodePath.Resolve = Resolve

local function Relative(fromAsPath: string, toAsPath: string): string
	local fromPathString = Normalize(fromAsPath)
	local toPathString = Normalize(toAsPath)

	local fromSegments = SmartSplit(fromPathString)
	local toSegments = SmartSplit(toPathString)

	local index = 1
	while index <= #fromSegments and index <= #toSegments and fromSegments[index] == toSegments[index] do
		index += 1
	end

	local relativeSegments = {}
	local length = 0

	for _ = index, #fromSegments do
		length += 1
		relativeSegments[length] = ".."
	end

	for jndex = index, #toSegments do
		length += 1
		relativeSegments[length] = toSegments[jndex]
	end

	return if length == 0 then "." else table.concat(relativeSegments, PATH_SEPARATOR)
end
NodePath.Relative = Relative

local function DirectoryName(path: string): string
	return (string.match(path, `(.*){PATH_SEPARATOR}[^{PATH_SEPARATOR}]*$`)) or ""
end
NodePath.DirectoryName = DirectoryName

local function ExtensionName(path: string): string
	local name = (string.match(path, "[^" .. PATH_SEPARATOR .. "]+$")) or ""
	for index = #name, 1, -1 do
		if (string.byte(name, index, index)) == 46 then
			return if index == 1 then "" else string.sub(name, index)
		end
	end

	return ""
end
NodePath.ExtensionName = ExtensionName

local function BaseName(path: string, extension: string?): string
	local name = (string.match(path, "[^^" .. PATH_SEPARATOR .. "]+$")) or ""
	return if extension
			and extension ~= ""
			and string.sub(name, -#extension) == extension
		then string.sub(name, 1, #name - #extension)
		else name
end
NodePath.BaseName = BaseName

local function GetChildren(path: string): {string}
	if not fs.isDir(path) then
		return {}
	end

	path = Normalize(path)
	local inDirectory = fs.readDir(path)
	local children = NewStringArray(#inDirectory)
	for index, child in inDirectory do
		children[index] = Normalize(Join(path, child))
	end
	return children
end
NodePath.GetChildren = GetChildren

local function GetDescendants(path: string): {string}
	path = Normalize(path)
	local descendants = GetChildren(path)
	local totalDescendants = #descendants
	local length = 0

	if totalDescendants > 0 then
		repeat
			length += 1
			local grandChildren = GetChildren(descendants[length])
			for index, grandChild in grandChildren do
				descendants[totalDescendants + index] = grandChild
			end
			totalDescendants += #grandChildren
		until length == totalDescendants
	end

	return descendants
end
NodePath.GetDescendants = GetDescendants

return table.freeze(NodePath)
