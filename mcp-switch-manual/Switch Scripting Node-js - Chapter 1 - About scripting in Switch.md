## 1. About scripting in Switch

Switch offers a comprehensive scripting environment[cite: 11]. With limited scripting experience, a user can substantially extend Switch's capabilities and provide for interaction with third-party systems in new and powerful ways[cite: 12].

### Scripting applications

**SwitchScriptTool** is a command line tool that is part of the Switch installation[cite: 13]. It offers the functionality to create Switch scripts and also to convert script representations from script folder to script package and back[cite: 14].

**SwitchScripter** is a Switch application component that offers a scripting development environment to allow you develop your own scripts[cite: 15]. To able to use the SwitchScripter, you need an active license for the Scripting Module[cite: 16].
_Note:_ An active license will give you complete access to the scripting API[cite: 17]. Therefore, information in the internal (XMP) and external datasets is accessible through the scripts, even though the Switch Metadata module is not licensed[cite: 18].

You can also define **script expressions** for certain properties of some of the flow elements (for example: the Job priority property for the Hold job flow element)[cite: 19].

SwitchScripter is installed as a separate application. It offers the following functionality[cite: 20]:

- Edit the Switch script declaration
- Emulate the Switch scripting API for testing purposes (only for legacy scripting languages)
- Set up specific input/output conditions for testing purposes (only for legacy scripting languages)

### Scripting language

As of Switch 2020 Spring, **Node.js JavaScript** is the preferred scripting language for Switch[cite: 21]. Some of the advantages of Node.js JavaScript are[cite: 21]:

- It's a modern JavaScript standard supported by Node.js
- It gives script writers the ability to use the full power of the Node.js ecosystem, for example, third-party node modules.
- It offers easy in-flow debugging[cite: 22].

As of Switch 2020 Fall, it is also possible to use **TypeScript** to create scripts based on Node.js[cite: 23]. TypeScript extends JavaScript by adding the concept of static type declarations, which makes it possible to find common bugs in the script before running the code[cite: 24]. This leads to less bugs in production and can save script writers a lot of time by not having to investigate and debug these problems at run time[cite: 25]. We also offer a TypeScript Declarations file for script writers to enable auto-completion for the classes and methods described in this Scripting reference[cite: 26].

Legacy JavaScript and VBScript are currently still supported but not documented in this new scripting guide (however, the legacy documentation will remain available through our website)[cite: 27]. In this document we focus on the use of Node.js[cite: 27].

_Note:_

- If you're new to Node.js, take a look at the chapter on Node.js scripting for more information about this scripting language[cite: 28].
- If you're switching from the legacy scripting API to the new Node.js scripting API, take a look at _Differences between the legacy and the Node.js based API_ on page 64 for a better understanding[cite: 29].

### Compatibility

Scripts created in a particular Switch/Node.js version can be used in a Switch of the same version or higher[cite: 31]. Script writers who want their script to run in multiple versions of Switch, should use the SwitchScripter and SwitchScriptTool of the oldest Switch version that they want to support[cite: 31].

| Switch version used to create Node.js scripts | Supported Node.js version | Node.js scripts created in this Switch version can be used in...                |
| :-------------------------------------------- | :------------------------ | :------------------------------------------------------------------------------ |
| Switch 2019 and lower                         | No support for Node.js    | No support for Node.js                                                          |
| Switch 2020 Spring                            | 12                        | Switch 2020 Spring & Fall, Switch 2021 Spring & Fall, Switch 2022 Spring & Fall |
| Switch 2020 Fall                              | 12                        | Switch 2020 Fall, Switch 2021 Spring & Fall, Switch 2022 Spring & Fall          |
| Switch 2021 Spring                            | 12 and 14                 | Switch 2021 Spring & Fall, Switch 2022 Spring & Fall                            |
| Switch 2021 Fall                              | 12, 14 and 16             | Switch 2021 Fall, Switch 2022 Spring & Fall                                     |
| Switch 2022 Spring                            | 12, 14 and 16             | Switch 2022 Spring & Fall                                                       |
| Switch 2022 Fall                              | 12, 14 and 16             | Switch 2022 Fall                                                                |
| Switch 2023 Fall                              | 12, 14, 16 and 18         | Switch 2023 Fall                                                                |
| Switch 2024 Spring                            | 12, 14, 16, 18            | Switch 2024 Spring                                                              |
| Switch 2024 Fall                              | 12, 14, 16, 18 and 20     | Switch 2024 Fall                                                                |

### Remark for Mac users

For scripts and Apps created in versions older than Switch 2021 Fall, Switch will use older versions of Node.js which are already Intel only, so that existing scripts and Apps will remain working on more recent Switch versions running on ARM[cite: 34]. However, we recommend script writers who create scripts that contain binaries, to foresee new versions of their scripts to not keep depending on Rosetta as Rosetta will get deprecated over time and is also slower[cite: 34].

For scripts and Apps created in Switch 2021 Fall or higher, Switch will start the Intel version of Node.js on Intel and the ARM version of Node.js on ARM and will be using Node.js 20[cite: 36]. Therefore script writers should ship binaries for Intel and ARM and do the necessary testing for their scripts to support both platforms[cite: 36].
