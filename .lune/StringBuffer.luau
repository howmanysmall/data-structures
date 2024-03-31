--!native
--!optimize 2
--!strict

local StringBuffer = {}
StringBuffer.ClassName = "StringBuffer"
StringBuffer.__index = StringBuffer

type Buffer = {
	Length: number,
	[number]: number | string,
}

local function Constructor()
	return setmetatable({Length = 0} :: Buffer, StringBuffer)
end

function StringBuffer.new(): StringBuffer
	local self: any = Constructor()
	return self
end

function StringBuffer.Append(self: Class, Value: number | string | StringBuffer)
	local Length = self.Length + 1
	self.Length = Length
	self[Length] = if type(Value) == "table" then `{Value}` else Value
	return self
end

function StringBuffer.AppendSafe(self: Class, Value: unknown)
	local Length = self.Length + 1
	self.Length = Length
	self[Length] = `{Value}`
	return self
end

function StringBuffer.Sort(self: Class, Comparator: nil | (A: number | string, B: number | string) -> boolean)
	table.sort(self :: any, Comparator)
	return self
end

StringBuffer.ToString = table.concat
StringBuffer.__tostring = table.concat

function StringBuffer.__add(self: Class, Other: unknown)
	return StringBuffer.AppendSafe(self, Other)
end
function StringBuffer.__concat(self: Class, Other: unknown)
	return StringBuffer.AppendSafe(self, Other)
end

type Class = typeof(Constructor())
export type StringBuffer = typeof(setmetatable(
	{} :: Buffer & {
		ClassName: "StringBuffer",
		Append: (self: StringBuffer, Value: number | string | StringBuffer) -> StringBuffer,
		AppendSafe: (self: StringBuffer, Value: unknown) -> StringBuffer,
		Sort: (
			self: StringBuffer,
			Comparator: nil | (A: number | string, B: number | string) -> boolean
		) -> StringBuffer,
		ToString: (self: StringBuffer, Separator: string?, Start: number?, Finish: number?) -> string,
	},
	{} :: {
		__add: (self: StringBuffer, Other: unknown) -> StringBuffer,
		__concat: (self: StringBuffer, Other: unknown) -> StringBuffer,
		__tostring: (self: StringBuffer) -> string,
	}
))
return table.freeze(StringBuffer)
