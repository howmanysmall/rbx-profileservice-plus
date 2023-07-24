local RepeatCache = {}

local function StringRep(ToRepeat: string, Amount: number): string
	local StringCache = RepeatCache[ToRepeat]
	if not StringCache then
		StringCache = {}
		RepeatCache[ToRepeat] = StringCache
	end

	local RepeatString = StringCache[Amount]
	if not RepeatString then
		RepeatString = string.rep(ToRepeat, Amount)
		StringCache[Amount] = RepeatString
	end

	return RepeatString
end

return StringRep
