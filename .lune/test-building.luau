--!optimize 2
--!strict
--[=[ lunar
	about = "Tests building."
]=]

local Chalk = require("@packages/Chalk")
local Console = require("@packages/Console")
local NodePath = require("@utilities/NodePath")
local TestingScript = require("@constants/TestingScript")
local fs = require("@lune/fs")
local process = require("@lune/process")

local SOURCE_PATH = NodePath.Resolve(process.cwd, "src")
local TESTING_SCRIPT_PATH = NodePath.Resolve(SOURCE_PATH, "testing.ts")

local function CreateTestingScript(): ()
	if not fs.isDir(SOURCE_PATH) then
		fs.writeDir(SOURCE_PATH)
	end

	fs.writeFile(TESTING_SCRIPT_PATH, TestingScript)
end

type BuildResult = {
	ErrorCode: number,
	Success: true,
} | {
	Error: string,
	ErrorCode: number,
	Success: false,
}

local function Build(): BuildResult
	local execResult = process.exec("bun", {"run", "build"})
	if execResult.ok then
		return {
			ErrorCode = execResult.code;
			Success = true;
		}
	end

	return {
		Error = `{execResult.stdout}{execResult.stderr}`;
		ErrorCode = execResult.code;
		Success = false;
	}
end

local function RemoveTestingScript(): ()
	if fs.isFile(TESTING_SCRIPT_PATH) then
		fs.removeFile(TESTING_SCRIPT_PATH)
	end
end

CreateTestingScript()
local result = Build()
RemoveTestingScript()
Build()

if not result.Success then
	Console.Warn(Chalk.Bold("The building failed with the following error:"))
	print(result.Error)
end

process.exit(result.ErrorCode)
