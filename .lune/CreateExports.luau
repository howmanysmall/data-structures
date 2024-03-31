--!native
--!optimize 2
--!strict

local FileInstance = require("./FileInstance")
local StringBuffer = require("./StringBuffer")
local fs = require("@lune/fs")
local process = require("@lune/process")
local stdio = require("@lune/stdio")

local SrcFileInstance = FileInstance.Mark("src")

local ExportIgnore: {[string]: true} = {}

local Success, Contents = pcall(fs.readFile, ".exportignore")
if Success then
	for _, Line in string.split(Contents, "\n") do
		if Line == "" or #Line == 0 then
			continue
		end

		ExportIgnore[Line] = true
	end
end

local Folders: {FileInstance.FileInstance} = {}
local Length = 0

for _, Child in SrcFileInstance:GetChildren() do
	if Child.IsDirectory then
		Length += 1
		Folders[Length] = Child
	end
end

table.sort(Folders, function(A, B)
	return `{A}` < `{B}`
end)

local FolderNames: {string} = table.clone(Folders :: {any})
for Index, Folder in Folders do
	FolderNames[Index] = `{Folder}`
end

local Indices = stdio.prompt("multiselect", "What folders do you want to export from?", FolderNames)
if #Indices == 0 then
	process.exit(0)
end

local String = StringBuffer.new()

local function ShouldSkip(WithSrc: string)
	if ExportIgnore[WithSrc] then
		return true
	end

	for IgnorePath in ExportIgnore do
		if string.match(IgnorePath, "%.tsx?$") then
			continue
		end

		if string.find(WithSrc, IgnorePath) then
			return true
		end
	end

	return false
end

for _, Index in Indices do
	local Folder = Folders[Index]
	if not Folder then
		warn("?")
		continue
	end

	local SubString = StringBuffer.new()

	for _, Descendant in Folder:GetDescendants() do
		if Descendant.IsDirectory then
			continue
		end

		local FullName = string.gsub(`{Descendant}`, "\\", "/")
		local CullTo = if string.sub(FullName, -3) == ".ts"
			then -4
			elseif string.sub(FullName, -4) == ".tsx" then -5
			else nil

		if CullTo == nil then
			print(`Skipping {FullName} as it is not a TypeScript file.`)
			continue
		end

		local WithSrc = string.gsub(FullName, "(.+)src", "src")
		if ShouldSkip(WithSrc) then
			print(`Skipping {FullName} as it is in .exportignore.`)
			continue
		end

		SubString:Append(`export * from "{string.sub(string.gsub(FullName, "(.+)src", "."), 1, CullTo)}";`)
	end

	String:Append(SubString:Sort():Append(""):ToString("\n"))
end

fs.writeFile("src/index.ts", String:ToString("\n"))
