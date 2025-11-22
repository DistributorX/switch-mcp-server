# ENFOCUS SWITCH 2024 Fall - Node.js Scripting

_(11-2024)_

## Contents

| Chapter                                                        | Page |
| :------------------------------------------------------------- | :--- |
| 1. About scripting in Switch...                                | 5    |
| 2. Scripting concepts.                                         | 7    |
| 2.1. Node.js scripting.                                        | 7    |
| 2.1.1. Node.js.                                                | 7    |
| 2.1.2. TypeScript.                                             | 7    |
| 2.1.3. Visual Studio Code.                                     | 7    |
| 2.2. Script element and script expression.                     | 8    |
| 2.3. Script folder.                                            | 8    |
| 2.3.1. Script folder structure.                                | 9    |
| 2.3.2. Script declaration.                                     | 10   |
| 2.3.3. Script program.                                         | 11   |
| 2.3.4. Icon.                                                   | 11   |
| 2.4. Script package.                                           | 11   |
| 2.4.1. Password protection.                                    | 12   |
| 2.5. Scripted plug-in.                                         | 12   |
| 2.6. SwitchScriptTool.                                         | 12   |
| 2.6.1. Create mode.                                            | 13   |
| 2.6.2. Pack mode.                                              | 14   |
| 2.6.3. Unpack mode.                                            | 14   |
| 2.6.4. Transpile mode.                                         | 15   |
| 2.6.5. Generate Translations mode.                             | 15   |
| 2.6.6. List mode.                                              | 16   |
| 2.7. SwitchScripter.                                           | 16   |
| 2.7.1. Launching SwitchScripter.                               | 16   |
| 2.7.2. Workspace window.                                       | 17   |
| 2.7.3. Toolbar.                                                | 18   |
| 2.7.4. Declaration pane.                                       | 19   |
| 2.7.5. Properties pane.                                        | 20   |
| 2.7.6. Message pane.                                           | 21   |
| 3. Developing scripts.                                         | 22   |
| 3.1. Script declaration.                                       | 22   |
| 3.1.1. Main script properties.                                 | 22   |
| 3.1.2. Execution mode.                                         | 26   |
| 3.1.3. Defining custom properties.                             | 27   |
| 3.1.4. Property editors.                                       | 29   |
| 3.1.5. Validating property values.                             | 32   |
| 3.1.6. External property editor.                               | 36   |
| 3.1.7. OAuth 2.0 authorization editor.                         | 38   |
| 3.2. Creating and using a script in Switch.                    | 41   |
| 3.2.1. Creating a script.                                      | 41   |
| 3.2.2. Using a script in a flow.                               | 43   |
| 3.3. Developing script code.                                   | 44   |
| 3.3.1. Configuring Visual Studio Code.                         | 44   |
| 3.3.2. Debugging script code.                                  | 45   |
| 3.4. Deploying a script.                                       | 48   |
| 3.4.1. Protecting a script.                                    | 48   |
| 3.5. Recommended ways to work with scripts.                    | 49   |
| 3.5.1. Developing a brand-new script.                          | 49   |
| 3.5.2. Starting from a script package.                         | 56   |
| 3.5.3. Starting from a legacy script.                          | 58   |
| 3.5.4. Updating older Node.js apps to work with Switch 2024.   | 59   |
| 3.6. Automating third-party applications.                      | 59   |
| 3.6.1. Third-party application settings.                       | 59   |
| 3.6.2. Property sets.                                          | 59   |
| 3.6.3. Communication requirements.                             | 61   |
| 3.6.4. Communication mechanisms.                               | 61   |
| 3.6.5. Text encoding issues.                                   | 62   |
| 4. Scripting reference.                                        | 64   |
| 4.1. About the Switch scripting API.                           | 64   |
| 4.2. Differences between the legacy and the Node.js based API. | 64   |
| 4.2.1. Entry points.                                           | 64   |
| 4.2.2. Property values.                                        | 65   |
| 4.2.3. Job file and dataset file access.                       | 66   |
| 4.2.4. Sending jobs.                                           | 66   |
| 4.2.5. Scripting API Mapping table.                            | 67   |
| 4.3. Entry points.                                             | 71   |
| 4.3.1. Script entry points.                                    | 71   |
| 4.3.2. Script expressions entry point.                         | 77   |
| 4.4. Switch class.                                             | 78   |
| 4.4.1. Methods.                                                | 78   |
| 4.5. FlowElement class.                                        | 82   |
| 4.5.1. Methods.                                                | 82   |
| 4.6. Job class.                                                | 87   |
| 4.6.1. Methods.                                                | 88   |
| 4.7. Connection class.                                         | 99   |
| 4.7.1. Methods.                                                | 99   |
| 4.8. Image Document class.                                     | 100  |
| 4.8.1. Static methods.                                         | 101  |
| 4.8.2. Instance methods.                                       | 102  |
| 4.9. PdfDocument class.                                        | 103  |
| 4.9.1. Static methods.                                         | 103  |
| 4.9.2. Instance methods.                                       | 105  |
| 4.10. PdfPage class.                                           | 106  |
| 4.10.1. Methods.                                               | 106  |
| 4.11. HttpRequest class.                                       | 108  |
| 4.11.1. Methods.                                               | 108  |
| 4.11.2. Properties.                                            | 108  |
| 4.12. HttpResponse class.                                      | 109  |
| 4.12.1. Methods.                                               | 109  |
| 4.13. XmlDocument class.                                       | 109  |
| 4.13.1. Methods.                                               | 109  |
| 4.14. XmpDocument class.                                       | 111  |
| 4.14.1. Query language.                                        | 111  |
| 4.14.2. Methods.                                               | 111  |
| 4.14.3. Standard XMP namespaces.                               | 112  |
| 4.15. Enumerations.                                            | 114  |
| 4.15.1. AccessLevel.                                           | 114  |
| 4.15.2. Connection.Level.                                      | 114  |
| 4.15.3. DatasetModel.                                          | 115  |
| 4.15.4. LogLevel.                                              | 115  |
| 4.15.5. Property Type.                                         | 116  |
| 4.15.6. Scope.                                                 | 117  |
| 4.15.7. EnfocusSwitchPrivateDataTag.                           | 118  |
| 4.15.8. ImageDocument.ColorMode.                               | 118  |
| 4.15.9. ImageDocument.ColorSpace.                              | 118  |
| 4.15.10. HttpRequest.Method.                                   | 119  |
| 4.15.11. Priority.                                             | 119  |
| 5. Samples.                                                    | 120  |
| 6. Third-Party License Information.                            | 121  |
| 7. Copyrights.                                                 | 135  |
