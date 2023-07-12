# DefinitelySetup Pull Request Template
## Title

[Short description of the new ceremony]

## Description

Please provide a detailed description of the ceremony you are proposing.

## Uploads

 - [ ] R1CS file
 - [ ] wasm file
 - [ ] Ceremony config file

**Process**

- open the PR from a branch named $YOUR_PROJECT_NAME-ceremony
- fill the *p0tionConfig.json* file accordingly:
    + The title of the ceremony will end up being its prefix. Prefixes are simply the title all lowercase, with dashes (*-*) instead of whitespace. For example, given a title of *Example Ceremony*, the prefix will be *example-ceremony*.
    + Fill the rest of the fields with the desired data, ensuring that each circuit details are correct, and that you chose the required Verification method.
    + In the artifacts fields, please add the correct path which should be:
        *./ceremonies/$PREFIX/$CIRCUIT_NAME.$EXTENSION* - note that we require both the *r1cs* and the *wasm* files.
    + *Note* that you can use [p0tion phase2cli](https://github.com/privacy-scaling-explorations/p0tion) as follows to verify that the config file is correct:
        * `phase2cli validate --template $PATH_TO_THE_TEMPLATE`
- create a directory inside *./ceremonies* and name it with the *prefix* (detailed in the bullet point above). 
- ensure that only these three files were added:
    + r1cs
    + wasm
    + p0tionConfig.json
- the destination path of the PR should be either of:
    + main (for production runs)
    + staging (for a test run)
    + development (for a test run using experimental features such as VM verification)
    
Failing to follow the above instructions, will result in the CI checks failing. If all is done accordingly, an administrator will approve and merge your PR and a ceremony will be setup for you. 

## Ceremony Details

**p0tionConfig.json** template:

```json 
{
  "title": "<CEREMONY_TITLE>",
  "description": "<CEREMONY_DESCRIPTION>",
  "startDate": "<START_DATE FORMAT: 2023-08-07T00:00:00>",
  "endDate": "<END_DATE FORMAT: 2023-09-10T00:00:00>",
  "timeoutMechanismType": "<TIMEOUT_MECHANISM FIXED/DYNAMIC>",
  "penalty": 10,
  "circuits": [
      {
          "description": "<CIRCUIT_DESCRIPTION>",
          "compiler": {
              "version": "<COMPILER_VERSION>",
              "commitHash": "<COMPILER_COMMIT_HASH>"
          },
          "template": {
              "source": "<HTTPS_URL_OF_THE_CIRCOM_FILE>",
              "commitHash": "<TEMPLATE_COMMIT_HASH>",
              "paramConfiguration": [6,8,3,2]
          },
          "verification": {
              "cfOrVm": "CF"
          },
          "artifacts": {
              "r1csLocalFilePath": "<PATH_TO_THE_CIRCUIT_R1CS>",
              "wasmLocalFilePath": "<PATH_TO_THE_CIRCUIT_WASM>"
          },
          "name": "<CIRCUIT_NAME>",
          "dynamicThreshold": 0,
          "fixedTimeWindow": 3600,
          "sequencePosition": 1
      }
  ]
}
```

**In-details**:

- title - a string representing the title of your ceremony. Please note that this will form the prefix (more details in the previous section).
- description - a string that can be used to describe a ceremony details
- startDate - the desired start date of your ceremony. Please note that might be changed by the admin.
- endDate - the end date of your ceremony.
- timeoutMechanismType - the type of timeout you would like to use for your ceremony. Options are *FIXED* or *DYNAMIC*. A fixed timeout will always be the same and users who are unable to progress throughout the contribution steps due to either having a slow connection or stopping the ongoing process, will be subject to a timeout of this length. Dynamic on the other hand, will adjust depending on the average time it takes to contribute. 
- penalty - how long will a user need to wait before being able to join the waiting queue again
- circuits - an array of circuit object:
    - description - a string describing the circuit 
    - compiler - an object made of:
        - version - a string with the compiler version. e.g. "1.0"
        - commitHash - a string with the commit id (needs to be a GitHub commit hash)
    - template - an object made of:
        - source - a string with the URL of the circom file
        - commitHash -  a string with the commit id (needs to be a GitHub commit hash)
        - paramConfiguration - an array of numbers with the parameters of the circuit template
    - verification - an object detailing how the circuit's zKeys will be verified
        - cfOrVm - a string with either "CF" or "VM". If "VM" the following must be added:
            - vmConfigurationType - a string with the VM type - options:
                * "t3.large"
                * "t3.2xlarge"
                * please refer to [AWS docs](https://aws.amazon.com/ec2/instance-types/) for more instance types
            - vmDiskSize - a number with the size of the disk
            - vmDiskType - a string with the type of the disk - options:
                * "gp2"
                * "gp3"
                * "io1"
                * "st1"
                * "sc1"
    - artifacts - an object with the local paths to the r1cs and wasm
        - r1csLocalFilePath - a string with the r1cs path e.g. "./ceremonies/ceremonyPrefix/circuit.r1cs"
        - wasmLocalFilePath - a string with the r1cs path e.g. "./ceremonies/ceremonyPrefix/circuit.wasm"
    - name - a string with the circuit name
    - dynamicThreshold - if selected dynamic timeout please enter the threshold here as a number
    - fixedTimeWindow - if selected fixed timeout please enter the time window here as a number
    - sequencePosition - a number with the circuit sequence position. Each sequence must be different and it should start from 1. The circuit with the lowest sequence number will be the first one which users will contribute to.

> Note: If the constraint size is less than 1M, your PR will be automatically approved and merged at the end of the week.

## Additional Notes

If there are any additional notes, requirements or special instructions related to this ceremony, please specify them here.

Confirmation
 - [ ] I have read and understood the DefinitelySetup guidelines and requirements.
 - [ ] I confirm that all uploaded files are correctly configured and adhere to the guidelines.
