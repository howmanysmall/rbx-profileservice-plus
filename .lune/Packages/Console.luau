--!optimize 2
--!strict

local Chalk = require("@packages/Chalk")
local Debug = require("@packages/Debug")
local Inspect = require("@packages/Inspect")

local INDENT = "  "

local RED = Chalk.Rgb(243, 53, 53)
local YELLOW = Chalk.Rgb(243, 174, 53)

local STRING_FORMAT_ARGUMENTS: {string} = {"c", "d", "i", "o", "u", "x", "X", "e", "E", "f", "g", "G", "q", "s", "*"}
local FORMAT_ARGUMENTS_MATCH = (function(): string
	local array = {}
	local set = {}
	local length = 0

	for _, key in STRING_FORMAT_ARGUMENTS do
		if set[key] then
			continue
		end

		length += 1
		array[length] = Debug.EscapeString(key)
		set[key] = true
	end

	return `%%[{table.concat(array)}]`
end)()

local function Pack<T...>(...: T...): {[number]: any, n: number}
	-- selene: allow(mixed_table)
	return {
		n = select("#", ...);
		select(1, ...);
	}
end
local function HasStringFormatArguments(formatString: string): boolean
	return (string.match(formatString, FORMAT_ARGUMENTS_MATCH)) ~= nil
end

type Memoized<T, U> = typeof(setmetatable({} :: {[T]: U}, {} :: {
	__call: (self: any, index: T) -> U,
	__index: (self: any, index: T) -> U,
}))

local function Memoize<T, U>(callback: (index: T) -> U): Memoized<T, U>
	local metatable = {}
	function metatable:__call(index: T): U
		return self[index]
	end

	function metatable:__index(index: T): U
		local value = callback(index)
		self[index] = value
		return value
	end

	return setmetatable({}, metatable)
end

local BOLD_GRAY = Chalk.Bold.Gray
local BOLD_INVERSE = Chalk.Bold.Inverse
local BOLD_INVERSES = Memoize(function(color: Chalk.Styler): Chalk.Styler
	return Chalk.CombineStyles(BOLD_INVERSE, color)
end)

local function GetTag(functionName: string, styler: Chalk.Styler?): string
	local tag = ` {string.upper(functionName)} `
	return `{BOLD_GRAY("[")}{if styler then BOLD_INVERSES[styler](tag) else tag}{BOLD_GRAY("]")}`
end

local Console = {}
local indentDepth = 0

local function Indent(): string
	return string.rep(INDENT, indentDepth)
end

local function CreatePrint(name: string, styler: Chalk.Styler?, editsIndent: boolean?): (...unknown) -> ()
	local prefix = GetTag(name, styler)

	local function logFunction(...: unknown): ()
		local length = select("#", ...)
		if length == 0 then
			print()
			if editsIndent then
				indentDepth += 1
			end
			return
		end

		local content = (...)
		if type(content) == "string" and HasStringFormatArguments(content) then
			local arguments = Pack(...)
			local success, value = pcall(string.format, content, table.unpack(arguments, 2, arguments.n))
			if success then
				print(Indent() .. prefix, value)
				if editsIndent then
					indentDepth += 1
				end
				return
			end
		end

		local array = table.create(length)
		for index = 1, length do
			local value = select(index, ...)
			array[index] = if type(value) == "string" then value else Inspect(value)
		end
		print(Indent() .. prefix, table.concat(array, " "))
		if editsIndent then
			indentDepth += 1
		end
	end

	return logFunction
end

local Log = CreatePrint("Log", Chalk.White)
local Warn = CreatePrint("Warn", YELLOW or Chalk.Yellow)

Console.Log = Log
Console.Info = CreatePrint("Info", Chalk.Blue)
Console.Debug = CreatePrint("Debug", Chalk.Cyan)
Console.Warn = Warn
Console.Error = CreatePrint("Error", RED or Chalk.Red)
Console.Group = CreatePrint("Group", Chalk.Magenta, true)
Console.GroupCollapsed = CreatePrint("GroupCollapsed", Chalk.Magenta.Dim, true)

function Console.GroupEnd(): ()
	if indentDepth > 0 then
		indentDepth -= 1
	end
end

local startTimes: {[string]: number} = {}
function Console.Time(label: string?): ()
	local trueLabel = label or "default"
	if startTimes[trueLabel] ~= nil then
		Warn(`Timer '{trueLabel}' already exists`)
		return
	end

	startTimes[trueLabel] = os.clock()
end
function Console.TimeEnd(label: string?): ()
	local finishTime = os.clock()
	local trueLabel = label or "default"
	local startTime = startTimes[trueLabel]
	if startTime == nil then
		Warn(`Timer '{trueLabel}' does not exist`)
		return
	end

	Log(`{trueLabel}: {(finishTime - startTime) * 1000} ms`)
	startTimes[trueLabel] = nil
end

return table.freeze(Console)
