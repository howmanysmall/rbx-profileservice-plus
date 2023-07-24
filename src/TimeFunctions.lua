local RunService = game:GetService("RunService")
local TimeFunctions = {}
TimeFunctions.TimeFunction = if RunService:IsRunning() then time else os.clock

-- function TimeFunctions.OsTime()
-- 	return DateTime.now().UnixTimestamp
-- end

-- function TimeFunctions.Tick()
-- 	return DateTime.now().UnixTimestampMillis / 1000
-- end

TimeFunctions.OsTime = os.time
TimeFunctions.Tick = tick

table.freeze(TimeFunctions)
return TimeFunctions
