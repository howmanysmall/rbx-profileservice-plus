--!optimize 2
--!strict

local Chalk = require("@packages/Chalk")
local Console = require("@packages/Console")
local Debug = require("@packages/Debug")
local NodePath = require("@utilities/NodePath")
local TestingScript = require("@constants/TestingScript")
local fs = require("@lune/fs")
local process = require("@lune/process")

local CWD = process.cwd
local SOURCE_PATH = NodePath.Resolve(CWD, "src")
local OUT_PATH = NodePath.Resolve(CWD, "out")
local TESTING_SCRIPT_PATH = NodePath.Resolve(SOURCE_PATH, "testing.ts")

local BuildingUtilities = {}

local function NewStringArray(size: number): {string}
	return (table.create(size) :: unknown) :: {string}
end
local function RemoveLeakage(path: string): string
	return (string.gsub(path, `^{Debug.EscapeString(CWD)}`, "./"))
end

local function GetDefinitionFiles(): {string}
	local children = fs.readDir(SOURCE_PATH)
	local definitionFiles = NewStringArray(#children - 1)
	local length = 0

	for _, child in children do
		if NodePath.ExtensionName(child) ~= ".ts" or not (string.find(child, "%.d%.ts$")) then
			continue
		end

		length += 1
		definitionFiles[length] = child
	end

	return definitionFiles
end
BuildingUtilities.GetDefinitionFiles = GetDefinitionFiles

local function CreateTestingScript(): ()
	if not fs.isDir(SOURCE_PATH) then
		fs.writeDir(SOURCE_PATH)
	end

	fs.writeFile(TESTING_SCRIPT_PATH, TestingScript)
end
BuildingUtilities.CreateTestingScript = CreateTestingScript

export type BuildResult = {
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
BuildingUtilities.Build = Build

local function ValidateBuiltCorrectly(): ()
	for _, definitionFile in GetDefinitionFiles() do
		local path = NodePath.Join(OUT_PATH, definitionFile)
		if not fs.isFile(path) then
			Console.Error(`You are missing the file located at {Chalk.Bold.Red(RemoveLeakage(path))}`)
			process.exit(2)
		end
	end
end
BuildingUtilities.ValidateBuiltCorrectly = ValidateBuiltCorrectly

local function RemoveTestingScript(): ()
	if fs.isFile(TESTING_SCRIPT_PATH) then
		fs.removeFile(TESTING_SCRIPT_PATH)
	end
end
BuildingUtilities.RemoveTestingScript = RemoveTestingScript

return table.freeze(BuildingUtilities)
