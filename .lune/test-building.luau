--!optimize 2
--!strict
--[=[ lunar
	about = "Tests building."
]=]

local BuildingUtilities = require("@utilities/BuildingUtilities")
local Chalk = require("@packages/Chalk")
local Console = require("@packages/Console")
local process = require("@lune/process")

BuildingUtilities.CreateTestingScript()
local result = BuildingUtilities.Build()
BuildingUtilities.RemoveTestingScript()
BuildingUtilities.Build()

if not result.Success then
	Console.Warn(Chalk.Bold("The building failed with the following error:"))
	print(result.Error)
end

BuildingUtilities.ValidateBuiltCorrectly()
process.exit(result.ErrorCode)
