--!optimize 2
--!strict
--[=[ lunar
	about = "Prepares the project for publishing."
]=]

local NodePath = require("@utilities/NodePath")
local fs = require("@lune/fs")
local process = require("@lune/process")

local SOURCE_PATH = NodePath.Resolve(process.cwd, "src")
local TESTING_SCRIPT_PATH = NodePath.Resolve(SOURCE_PATH, "testing.ts")

local function Build(): ()
	local execResult = process.exec("bun", {"run", "build"})
	if not execResult.ok then
		print(`{execResult.stdout}{execResult.stderr}`)
	end
end

local function RemoveTestingScript(): ()
	if fs.isFile(TESTING_SCRIPT_PATH) then
		fs.removeFile(TESTING_SCRIPT_PATH)
	end
end

RemoveTestingScript()
Build()
