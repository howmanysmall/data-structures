--!native
--!optimize 2
--!strict

local fs = require("@lune/fs")
local process = require("@lune/process")

local FileInstance = {}
FileInstance.ClassName = "FileInstance"
FileInstance.__index = FileInstance

local function Constructor(FilePath: string, FileName: string?)
	local NewFilePath = if FileName then `{FilePath}/{FileName}` else FilePath
	return setmetatable({
		Children = nil :: {Class}?;
		FilePath = NewFilePath;
		IsDirectory = fs.isDir(NewFilePath);
	}, FileInstance)
end

function FileInstance.Mark(FilePath: string, FileName: string?): FileInstance
	local self: any = Constructor(FilePath, FileName)
	return self
end

function FileInstance.Is(Value: any)
	return type(Value) == "table" and getmetatable(Value) == FileInstance
end

function FileInstance.GetFullName(self: Class)
	local FilePath = self.FilePath
	if string.sub(FilePath, 1, 2) == "./" then
		FilePath = string.sub(FilePath, 3)
	end

	return process.cwd .. string.gsub(FilePath, "/", "\\")
end

function FileInstance.GetChildren(self: Class): {Class}
	if self.Children then
		return self.Children
	end

	if self.IsDirectory then
		local Children = table.clone(fs.readDir(self.FilePath)) :: any
		for Index, Child in Children do
			Children[Index] = FileInstance.Mark(self.FilePath, Child)
		end

		self.Children = Children :: {Class}
		return Children :: {Class}
	else
		local Children: {Class} = {}
		self.Children = Children
		return Children
	end
end

function FileInstance.GetDescendants(self: Class): {Class}
	local Descendants = self:GetChildren()
	local TotalDescendants = #Descendants
	local Length = 0

	if TotalDescendants > 0 then
		repeat
			Length += 1
			local GrandChildren = Descendants[Length]:GetChildren()
			for Index, GrandChild in GrandChildren do
				Descendants[TotalDescendants + Index] = GrandChild
			end

			TotalDescendants += #GrandChildren
		until Length == TotalDescendants
	end

	return Descendants
end

function FileInstance.Read(self: Class)
	return if self.IsDirectory then nil else fs.readFile(self.FilePath)
end

function FileInstance.Write(self: Class, Source: string)
	if not self.IsDirectory then
		fs.writeFile(self.FilePath, Source)
	end
end

function FileInstance.HasDirectoryAncestor(self: Class, Name: string)
	return string.find(`{self}`, `{Name}/`) ~= nil
end

function FileInstance.__tostring(self: Class)
	return self:GetFullName()
end

export type Class = typeof(Constructor("."))
export type FileInstance = {
	FilePath: string,
	IsDirectory: boolean,

	GetChildren: (self: FileInstance) -> {FileInstance},
	GetDescendants: (self: FileInstance) -> {FileInstance},
	GetFullName: (self: FileInstance) -> string,

	HasDirectoryAncestor: (self: FileInstance, Name: string) -> boolean,

	Read: (self: FileInstance) -> string?,
	Write: (self: FileInstance, Source: string) -> (),
}

table.freeze(FileInstance)
return table.freeze({
	Is = FileInstance.Is;
	Mark = FileInstance.Mark;
})
