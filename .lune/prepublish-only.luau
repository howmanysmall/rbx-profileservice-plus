--!optimize 2
--!strict
--[=[ lunar
	about = "Prepares the project for publishing."
]=]

local BuildingUtilities = require("@utilities/BuildingUtilities")
local process = require("@lune/process")

BuildingUtilities.RemoveTestingScript()
local result = BuildingUtilities.Build()
if not result.Success then
	print(result.Error)
end
BuildingUtilities.ValidateBuiltCorrectly()
process.exit(result.ErrorCode)
