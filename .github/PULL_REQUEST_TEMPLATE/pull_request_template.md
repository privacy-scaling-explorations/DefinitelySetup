# DefinitelySetup Pull Request Template
## Title

[Short description of the new ceremony]

## Description

Please provide a detailed description of the ceremony you are proposing.

## Uploads

 - [ ] R1CS files 
 - [ ] wasm files 
 - [ ] Ceremony config file (1 for all circuits)

 > Note: you can use the bash script **setup_cereremony_config.sh** to upload your artifacts to AWS S3 and fill the config file.

**Process**

> Feel free to delete this section once submitting your PR. This is left here as guidelines. 

- open the PR from a branch named $YOUR_PROJECT_NAME-ceremony
- fill the *p0tionConfig.json* file accordingly:
    + The title of the ceremony will end up being its prefix. Prefixes are simply the title all lowercase, with dashes (*-*) instead of whitespace. For example, given a title of *Example Ceremony*, the prefix will be *example-ceremony*.
    + Fill the rest of the fields with the desired data, ensuring that each circuit details are correct, and that you chose the required Verification method.
    + In the artifacts fields, please add the correct storage path and bucket name - note that we require both the *r1cs* and the *wasm* files.
    + *Note* that you can use [p0tion phase2cli](https://github.com/privacy-scaling-explorations/p0tion) as follows to verify that the config file is correct:
        * `phase2cli validate --template $PATH_TO_THE_TEMPLATE`
- create a directory inside *./ceremonies* and name it with the *prefix* (detailed in the bullet point above). 
- ensure that only these files were added:
    + r1cs for each circuit configuration
    + wasm for each circuit configuration
    + p0tionConfig.json
- the destination path of the PR should be either of:
    + main (for production runs)
    + staging (for a test run)
    + development (for a test run using experimental features such as VM verification)

> Note. If your circuit accepts metaparameters, and you desire including multiple parameter combinations in a single ceremony, add one circuit object inside the circuits array (of p0tionConfig.json) for EACH parameters combinations. This way, contributors will be able to contribute to the zKeys for all of the required parameters combinations. 
    
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
  "penalty": "<THE_PENALTY_APPLIED_TO_USERS (NUMBER)>",
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
              "paramsConfiguration": ["<CIRCUIT_INSTANCE_PARAMETERS_ARRAY>"]
          },
          "verification": {
              "cfOrVm": "<DESIRED_VERIFICATION_MECHANISM (VM/CF)>"
          },
          "artifacts": {
              "bucket": "<THE_BUCKET_NAME>",
              "region": "<THE_AWS_REGION_WHERE_THE_BUCKET_LIVES>",
              "r1csLocalFilePath": "<PATH_TO_THE_CIRCUIT_R1CS>",
              "wasmLocalFilePath": "<PATH_TO_THE_CIRCUIT_WASM>"
          },
          "name": "<CIRCUIT_NAME>",
          "dynamicThreshold": "<THE_DYNAMIC_THRESHOLD (NUMBER)>",
          "fixedTimeWindow": "<THE_FIXED_TIME_WINDOW_FOR_CONTRIBUTION (NUMBER)>",
          "sequencePosition": "<THE_SEQUENCE_POSITION_OF_THE_CIRCUIT_INSTANCE (NUMBER)>"
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
        - paramsConfiguration - an array of numbers with the parameters of the circuit template
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
    - artifacts - an object with the storage path to the r1cs and wasm on s3
        - bucket - a string with the bucket name
        - region - the AWS region where the bucket live
        - r1csStoragePath - a string with the r1cs storage path e.g. "test-ceremony/circuit.r1cs"
        - wasmStoragePath - a string with the wasm storage path e.g. "test-ceremony/circuit.wasm"
    - name - a string with the circuit name
    - dynamicThreshold - if selected dynamic timeout please enter the threshold here as a number
    - fixedTimeWindow - if selected fixed timeout please enter the time window here as a number
    - sequencePosition - a number with the circuit sequence position. Each sequence must be different and it should start from 1. The circuit with the lowest sequence number will be the first one which users will contribute to.

> Note: If the constraint size is less than 1M, your PR will be automatically approved and merged at the end of the week.

## Additional Notes

If there are any additional notes, requirements or special instructions related to this ceremony, please specify them here.

Confirmation

 - [ ] I have read and understood the DefinitelySetup guidelines and requirements.
 - [ ] I confirm that all uploaded files are correctly configured and adhere to the guidelines:
    - [ ] The origin branch of the ceremony has the postfix **-ceremony**
    - [ ] The target branch is either dev/staging/main
    - [ ] I uploaded one r1cs and one wasm file for each of the parameters combinations I want users to contribute to
    - [ ] I named the directory following the ceremony prefix syntax (described in the sections above)
    - [ ] I run `phase2cli verify --template $MY_TEMPLATE_PATH` and the output was **true**
    - [ ] If more than one circuit instance, I have correctly set the *sequenceNumber* from 1 to n circuits
