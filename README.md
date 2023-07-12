<p align="center">
    <h1 align="center">
        DefinitelySetup Open BETA
    </h1>
    <p align="center">The repository for high quality Trusted setups for groth16 based SNARKS.</p>
</p>

## Introduction
DefinitelySetup is a product designed to run Trusted Setup ceremonies for groth16 based snarks. This document provides step-by-step guide on how to utilize DefinitelySetup.

### Instructions for DefinitelySetup 

Steps for Using DefinitelySetup to run your own ceremony:

- Prepare your files: Before anything else, you will need to prepare your R1CS, wasm, and ceremony config files for uploading to the DefinitelySetup repository.

- Create a Pull Request: Once your files are ready, you'll need to create a pull request (PR) in the DefinitelySetup repository. Use the provided PR template to guide you in filling out the necessary information.

- Approval and Merging: If your circuit's constraint size is less than 1M, your PR will be automatically approved and merged at the end of the week. If you are trying to run a ceremony for a circuit with larger contraing sizes please open an issue to start a grant flow to cover infrastrcture costs.

- Starting the Ceremony: Once your PR is merged, the ceremony will commence. You and other users will be able to see the ceremony on the DefinitelySetup website.

- Contribute via the CLI: During the ceremony, you can use the provided CLI to contribute to the process. Detailed instructions for using the CLI will be provided on the DefinitelySetup website.

- Download Finalized Zkeys: After the ceremony concludes, the finalized zkeys will be made available for download. Ensure to check back frequently for updates or await notifications regarding completion.

Please note that these are the fundamental steps and additional details or steps may be necessary based on the specifics of your project or ceremony configuration.

Remember, DefinitelySetup is designed to simplify and streamline the process of running Trusted Setup ceremonies, and we're here to support you through each step of the process.
