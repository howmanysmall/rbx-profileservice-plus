--!native
--!nonstrict
--!optimize 2

local function ThreadArray(size: number): {thread}
	return (table.create(size) :: unknown) :: {thread}
end

local freeThreads: {thread} = ThreadArray(500)
local freeAmount = 0

local function Execute<Arguments...>(callback: (Arguments...) -> (), thread: thread, ...: Arguments...): ()
	callback(...)
	freeAmount += 1
	freeThreads[freeAmount] = thread
end

local function Yield(): ()
	while true do
		Execute(coroutine.yield())
	end
end

local function SafeFastSpawn<Arguments...>(callback: (Arguments...) -> (), ...: Arguments...): thread
	if type(callback) == "thread" then
		return task.spawn(callback, ...)
	end

	local thread: thread = nil
	if freeAmount > 0 then
		thread = freeThreads[freeAmount]
		freeThreads[freeAmount] = nil
		freeAmount -= 1
	else
		thread = coroutine.create(Yield)
		coroutine.resume(thread)
	end

	return task.spawn(thread, callback, thread, ...)
end

return SafeFastSpawn
