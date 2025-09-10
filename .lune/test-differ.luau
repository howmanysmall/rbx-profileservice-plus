--!optimize 2
--!nonstrict

local Differ = require("../out/differ")
local NoYield = require("../out/no-yield")

type Profile<T> = {
	Data: T & {},
}

local function ProfileUpdate<T>(
	profile: Profile<T & {}>,
	callback: (profileData: T & {}) -> (),
	fire: (path: string) -> ()
)
	local dataBefore = Differ.copyDeepWithCircularCheck(profile.Data, nil)
	local success, exception = pcall(function()
		return NoYield(callback, profile.Data)
	end)

	if not success then
		profile.Data = dataBefore
		local exceptionString = tostring(exception)
		if (string.find(exceptionString, "yield", 1, true)) == nil then
			error("[ProfileServicePlus] Update failed: " .. exceptionString)
		end
		error("[ProfileServicePlus] Update callback cannot yield - callbacks must be synchronous: " .. exceptionString)
	end

	local changesSet = {}
	Differ.diffTables(dataBefore, profile.Data, "", changesSet, 0)

	local paths, count = Differ.buildPathArray(changesSet)
	if count > 0 then
		for _, path in paths do
			fire(path)
		end
	end
end

type ProfileData = {
	coolString: string,
	object: {
		deeperObject: {
			coolGuy: boolean,
		},
		number: number,
	},
}

local function runTest(testName: string, setup: () -> Profile<any>, update: (data: any) -> (), expectedPaths: {string})
	print(`\n--- {testName} ---`)
	local profile = setup()
	local actualPaths = {}
	
	ProfileUpdate(profile, update, function(path: string)
		table.insert(actualPaths, path)
	end)
	
	table.sort(actualPaths)
	table.sort(expectedPaths)
	
	local success = #actualPaths == #expectedPaths
	if success then
		for i, path in actualPaths do
			if path ~= expectedPaths[i] then
				success = false
				break
			end
		end
	end
	
	if success then
		print("✅ PASS")
		for _, path in actualPaths do
			print("  ", path)
		end
	else
		print("❌ FAIL")
		print("Expected:", table.concat(expectedPaths, ", "))
		print("Actual:", table.concat(actualPaths, ", "))
	end
end

-- Test 1: Basic value changes
runTest("Basic value changes", function()
	return {
		Data = {
			coolString = "Yeah!",
			object = {
				deeperObject = {coolGuy = true},
				number = 42,
			},
		}
	}
end, function(data)
	data.coolString = "Hello, world!"
	data.object.deeperObject.coolGuy = false
end, {"coolString", "object.deeperObject.coolGuy"})

-- Test 2: No changes
runTest("No changes", function()
	return {
		Data = {
			value = 42,
			nested = {inner = "test"}
		}
	}
end, function(data)
	-- No changes
end, {})

-- Test 3: Adding new keys
runTest("Adding new keys", function()
	return {
		Data = {
			existing = "value"
		}
	}
end, function(data)
	data.newKey = "added"
	data.existing = "changed"
end, {"existing", "newKey"})

-- Test 4: Deleting keys  
runTest("Deleting keys", function()
	return {
		Data = {
			keep = "this",
			delete = "this"
		}
	}
end, function(data)
	data.delete = nil
end, {"delete"})

-- Test 5: Type changes
runTest("Type changes", function()
	return {
		Data = {
			changeType = 42
		}
	}
end, function(data)
	data.changeType = "now string"
end, {"changeType"})

-- Test 6: Nested table changes
runTest("Nested table changes", function()
	return {
		Data = {
			level1 = {
				level2 = {
					level3 = {
						deep = "value"
					}
				}
			}
		}
	}
end, function(data)
	data.level1.level2.level3.deep = "changed"
	data.level1.level2.newDeep = "added"
end, {"level1.level2.level3.deep", "level1.level2.newDeep"})

-- Test 7: Mixed operations
runTest("Mixed operations", function()
	return {
		Data = {
			unchanged = "stays",
			change = "old",
			delete = "gone",
			nested = {
				keep = 1,
				change = 2
			}
		}
	}
end, function(data)
	data.change = "new"
	data.delete = nil
	data.add = "fresh"
	data.nested.change = 3
	data.nested.add = 4
end, {"add", "change", "delete", "nested.add", "nested.change"})

-- Test 8: Empty tables
runTest("Empty tables", function()
	return {
		Data = {}
	}
end, function(data)
	data.first = "item"
end, {"first"})

-- Test 9: Boolean and nil values
runTest("Boolean and nil values", function()
	return {
		Data = {
			bool = true,
			nilValue = nil,
			zero = 0,
			empty = ""
		}
	}
end, function(data)
	data.bool = false
	data.nilValue = "not nil"
	data.zero = nil
	data.empty = "not empty"
end, {"bool", "empty", "nilValue", "zero"})

-- Test 10: Arrays/lists
runTest("Arrays/lists", function()
	return {
		Data = {
			list = {1, 2, 3}
		}
	}
end, function(data)
	data.list[2] = 99
	data.list[4] = 4
end, {"list.2", "list.4"})
