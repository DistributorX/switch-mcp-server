# Enumerations (Chapter 4.15)

## AccessLevel
- `ReadOnly`, `ReadWrite`

## Connection.Level
- `Success`, `Warning`, `Error`

## DatasetModel
- `JDF`, `JMF`, `XML`, `XMP`, `JSON`, `Unknown`

## LogLevel
- `Debug`, `Info`, `Warning`, `Error`

## PropertyType
- `Literal`, `Number`, `Date`, `HoursAndMinutes`, `Boolean`, `String`, `FilePath`, `FolderPath`, `FileType`, `FolderPattern`, `Regex`, `OAuthToken`
  - Editor mapping: Literal ↔ Literal editor; Number ↔ Number; Date ↔ Date/DateTime; HoursAndMinutes ↔ hh:mm; Boolean ↔ No/Yes or Condition; FilePath ↔ Choose file; FolderPath ↔ Choose folder; FileType ↔ File type(s)/patterns; FolderPattern ↔ Folder patterns; Regex ↔ Regular expression; OAuthToken ↔ OAuth 2.0 authorization; String ↔ all others. Number is integer (no float editors). Literal “None” returns empty string.

## Scope
- `Job`, `Flow`, `Global`, `User`

## EnfocusSwitchPrivateDataTag
- `emailAddresses`, `emailBody`, `hierarchy`, `origin` (read-only), `userEmail`, `userFullName`, `userName`, `initiated`, `submittedTo`, `state` (all prefixed with `EnfocusSwitch.`)

## ImageDocument.ColorMode
- `Bitmap`, `Gray`, `IndexedColor`, `RGB`, `CMYK`, `Multichannel`, `Duotone`, `LabColor`, `Unknown`

## ImageDocument.ColorSpace
- `SRGB`, `Uncalibrated`

## HttpRequest.Method
- `POST`, `PUT`, `DELETE` (global alias `EnfocusSwitch.HttpRequest.Method`)

## Priority
- `Low` (-100000), `BelowNormal` (-10000), `Normal` (0), `AboveNormal` (10000), `High` (100000). Any numeric value is allowed for job priority.
