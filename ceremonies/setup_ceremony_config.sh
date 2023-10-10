#!/bin/bash

# Defaults
fixed_time_window=10
dynamic_threshold=10
penalty=10

# Check if jq is installed
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed. Please install jq and try again.' >&2
  exit 1
fi

# Check if AWS cli is installed
if ! [ -x "$(command -v aws)" ]; then
  echo 'Error: aws is not installed. Please install aws, setup a profile and try again.' >&2
  echo 'More info on how to install and setup can be found here https://aws.amazon.com/cli/' >&2
  exit 1
fi

# Check if circom is installed
if ! [ -x "$(command -v circom)" ]; then
  echo 'Error: circom is not installed. Please install circom and try again.' >&2
  echo 'You can install circom following the instructions here: https://docs.circom.io/getting-started/installation/' >&2
  echo 'Please note it is your responsibility to ensure that the correct version of circom is installed.' >&2
  exit 1
fi

echo -e '\033[35m'
echo '██████╗ ███████╗███████╗██╗███╗   ██╗██╗████████╗███████╗██╗  ██╗   ██╗███████╗███████╗████████╗██╗   ██╗██████╗ '
echo '██╔══██╗██╔════╝██╔════╝██║████╗  ██║██║╚══██╔══╝██╔════╝██║  ╚██╗ ██╔╝██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗'
echo '██║  ██║█████╗  █████╗  ██║██╔██╗ ██║██║   ██║   █████╗  ██║   ╚████╔╝ ███████╗█████╗     ██║   ██║   ██║██████╔╝'
echo '██║  ██║██╔══╝  ██╔══╝  ██║██║╚██╗██║██║   ██║   ██╔══╝  ██║    ╚██╔╝  ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ '
echo '██████╔╝███████╗██║     ██║██║ ╚████║██║   ██║   ███████╗███████╗██║   ███████║███████╗   ██║   ╚██████╔╝██║     '
echo '╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝   ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝'
echo -e '\033[0m'
echo -e '\nWelcome to \033[35mDefinitelySetup\033[0m p0tion config generator! '
echo -e "\nPlease ensure that each pair of r1cs and wasm files have the same name."

# Ask for AWS details
echo -e "\nEnter AWS region:"
read region
echo -e "\nEnter AWS profile:"
read profile
echo -e "\nEnter S3 bucket name:"
read bucket
echo -e "\nEnter the directory where the files are located:"
read directory

# Remove trailing slash if present:
directory=${directory%/}

# Ask if circuits are compiled
are_compiled=""
while [[ "$are_compiled" != "yes" && "$are_compiled" != "no" ]]; do
    echo -e "\nAre the circuits already compiled to r1cs and wasm? (yes/no)"
    read are_compiled
done

# If not, compile them
if [ "$are_compiled" = "no" ]; then
    echo -e "\nCompiling circuits..."
    for file in $directory/*.circom
    do
        circom "$file" --r1cs --wasm --output $directory 2>/dev/null
    done
fi

# Ask for top level information
echo -e "\nEnter title:"
read title
echo -e "\nEnter description:"
read description

# Determine OS
os=$(uname)

if [[ "$os" == "Darwin" ]]; then
  # macOS commands
  startDate=$(date -u -v+7d +'%Y-%m-%dT%H:%M:%S')
  endDate=$(date -u -v+1m -v+7d +'%Y-%m-%dT%H:%M:%S')
elif [[ "$os" == "Linux" ]]; then
  # Linux commands
  startDate=$(date -u --date='1 week' +'%Y-%m-%dT%H:%M:%S')
  endDate=$(date -u --date='1 month 1 week' +'%Y-%m-%dT%H:%M:%S')
else
  echo -e "\nError: Unsupported OS. Please use macOS or Linux." >&2
  exit 1
fi

timeoutMechanismType=""
while [[ "$timeoutMechanismType" != "FIXED" && "$timeoutMechanismType" != "DYNAMIC" ]]; do
  echo -e "\nEnter timeout mechanism type (FIXED/DYNAMIC):"
  read timeoutMechanismType
done

compiler_version=$(circom --version | awk  '{ print $3 }')

echo -e "\nIs the compiler the same for all circuits? (yes/no)"
read same_compiler

if [ "$same_compiler" = "yes" ]; then
    # determine circom details
    case "$compiler_version" in
        "2.1.6")
        compiler_commit_hash="57b18f68794189753964bfb6e18e64385fed9c2c"
        ;;
        "2.1.5")
        compiler_commit_hash="127414e9088cc017a357233f30f3fd7d91a8906c"
        ;;
        "2.1.4")
        compiler_commit_hash="ca3345681549c859af1f3f42128e53e3e43fe5e2"
        ;;
        "2.1.3")
        compiler_commit_hash="1dadb4aea6551c774b5d1b65fdd4d42567d3064e"
        ;;
        "2.1.2")
        compiler_commit_hash="2fbf9657b37488fc4bb37a51283c4bc7d424f0cb"
        ;;
        "2.1.1")
        compiler_commit_hash="95f39184ae1a56fbfe736863156e2c70d083c658"
        ;;
        "2.1.0")
        compiler_commit_hash="b7ad01b11f9b4195e38ecc772291251260ab2c67"
        ;;
        "2.0.9")
        compiler_commit_hash="bdc9d9d57490f113161f3adf818120f064b7b5b2"
        ;;
        "2.0.8")
        compiler_commit_hash="5703a808f82f7ff941ed08b6616a85fb233f9950"
        ;;
        "2.0.7")
        compiler_commit_hash="c0d74c2b0d8b0a61b84e292b3ab16277285b5abf"
        ;;
        "2.0.6")
        compiler_commit_hash="3fa5592c41a59a8a79cb6a328606c64a4b451762"
        ;;
        "2.0.5")
        compiler_commit_hash="ed807764a17ce06d8307cd611ab6b917247914f5"
        ;;
        "2.0.4")
        compiler_commit_hash="58449c21da772267d23da2636f054030f0e11d15"
        ;;
        "2.0.3")
        compiler_commit_hash="68762c517e01dd8e309066e7b1bffe400aad9461"
        ;;
        "2.0.2")
        compiler_commit_hash="6b8e1dca925a922608859c8935d2c84b716d545e"
        ;;
        "2.0.1")
        compiler_commit_hash="b77966a3497a4d2505197f68f56860296e962b74"
        ;;
        *)
        echo -e "\nUnsupported circom version. Please use a version from the list."
        exit 1
        ;;
    esac
fi

echo -e "\nIs the template source and commit hash the same for all circuits? (yes/no)"
read same_template

if [ "$same_template" = "yes" ]; then
    echo -e "\nEnter template source:"
    read template_source
    echo -e "\nEnter template commit hash:"
    read template_commit_hash
fi

same_verification=""
while [[ "$same_verification" != "yes" && "$same_verification" != "no" ]]; do
    echo -e "\nIs the verification method the same for all circuits? (yes/no)"
    read same_verification
done

if [ "$same_verification" = "yes" ]; then
    verification_method=""
    while [[ "$verification_method" != "CF" && "$verification_method" != "VM" ]]; do
        echo -e "\nEnter verification method (CF/VM):"
        read verification_method
    done

    if [ "$verification_method" = "VM" ]; then
        echo -e "\nTo find ec2 details please visit: https://aws.amazon.com/ec2/instance-types/"
        echo -e "\nEnter VM configuration type:"
        read vm_configuration_type
        echo -e "\nEnter VM disk size (number):"
        read vm_disk_size
        echo -e "\nEnter VM disk type:"
        read vm_disk_type
    fi
fi

# Find .r1cs and .wasm files recursively:
# Create a temporary directory
tmp_dir=$(mktemp -d $PWD/temp_dir_XXXXXXXX)

# Copy all .wasm and .r1cs files to the temporary directory
find $directory -type f \( -name "*.wasm" -o -name "*.r1cs" \) -exec cp {} $tmp_dir/ \;

# Get a list of all files in the temporary directory
file_list=$(ls $tmp_dir/*.{r1cs,wasm})

echo -e "\nFile list: \n$file_list"

# Create a new array to hold processed files
processed_files=()

circuits_array=()

index=1
for file_path in $file_list
do
    # Get the base name 
    base_name="${file_path%.*}"

    # Skip this iteration if this file has already been processed
    if [[ " ${processed_files[@]} " =~ " ${base_name} " ]]; then
        continue
    fi

    # Otherwise, add this base name to the processed files array
    processed_files+=("$base_name")

    # Upload 
    echo -e "\nUploading $base_name.r1cs to $bucket in $region..."   
    aws s3 cp $base_name.r1cs s3://$bucket/ --acl public-read --profile $profile --region $region

    echo -e "\nUploading $base_name.wasm to $bucket in $region..."
    aws s3 cp $base_name.wasm s3://$bucket/ --acl public-read --profile $profile --region $region

    # Get the file name only
    base_name=$(basename "${file_path%.*}")

    if [ "$same_compiler" = "no" ]; then
        echo -e "\nEnter compiler version:"
        read compiler_version
        echo -e "\nEnter compiler commit hash:"
        read compiler_commit_hash
    fi

    if [ "$same_template" = "no" ]; then
        echo -e "\nEnter template source:"
        read template_source
        echo -e "\nEnter template commit hash:"
        read template_commit_hash
    fi

    if [ "$same_verification" = "no" ]; then
        echo -e "\nEnter verification method (CF/VM):"
        read verification_method

        if [ "$verification_method" = "VM" ]; then
            echo -e "\nEnter VM configuration type:"
            read vm_configuration_type
            echo -e "\nEnter VM disk size (number):"
            read vm_disk_size
            echo -e "\nEnter VM disk type:"
            read vm_disk_type
        fi
    fi

    echo -e "\nEnter circuit description:"
    read circuit_description

    echo -e "\nEnter paramsConfiguration values as a comma-separated list (e.g. 6,8,3,2):"
    read param_str
    params=$(jq -nR '[(input | split(",")[] | tonumber)]' <<< "$param_str")

    # Create circuit object
    circuit=$(jq -n \
            --arg compiler_version "$compiler_version" \
            --arg compiler_commit_hash "$compiler_commit_hash" \
            --arg template_source "$template_source" \
            --arg template_commit_hash "$template_commit_hash" \
            --arg circuit_description "$circuit_description" \
            --arg bucket "$bucket" \
            --arg region "$region" \
            --arg index "$index" \
            --arg verification_method "$verification_method" \
            --arg vm_configuration_type "$vm_configuration_type" \
            --arg vm_disk_size "$vm_disk_size" \
            --arg vm_disk_type "$vm_disk_type" \
            --arg base_name "$base_name" \
            --argjson params "$params" \
            '{
                "description": $circuit_description,
                "compiler": {"version": $compiler_version, "commitHash": $compiler_commit_hash},
                "template": {"source": $template_source, "commitHash": $template_commit_hash, "paramsConfiguration": $params},
                "verification": ($verification_method | if . == "CF" then {"cfOrVm": "CF"} else {"cfOrVm": "VM", "vmConfigurationType": $vm_configuration_type, "vmDiskSize": $vm_disk_size|tonumber, "vmDiskType": $vm_disk_type} end),
                "artifacts": {"r1csStoragePath": ("https://" + $bucket + ".s3." + $region + ".amazonaws.com/" + $base_name + ".r1cs"), "wasmStoragePath": ("https://" + $bucket + ".s3." + $region + ".amazonaws.com/" + $base_name + ".wasm")},
                "name": $base_name,
                "sequencePosition": $index|tonumber
            }')

    # Conditionally add dynamicThreshold or fixedTimeWindow
    if [ "$timeoutMechanismType" = "FIXED" ]; then
        circuit=$(echo "$circuit" | jq --arg fixed_time_window "$fixed_time_window" '. + {fixedTimeWindow: $fixed_time_window|tonumber}')
    elif [ "$timeoutMechanismType" = "DYNAMIC" ]; then
        circuit=$(echo "$circuit" | jq --arg dynamic_threshold "$dynamic_threshold" '. + {dynamicThreshold: $dynamic_threshold|tonumber}')
    fi

    # append to the circuits array
    circuits_array+=("$circuit")

    index=$((index+1))
done

# convert bash array to json array
circuits_json=$(echo -e "${circuits_array[@]}" | tr ' ' '\n' | jq -s -c '.')

# Create json object
json=$(jq -n \
            --arg title "$title" \
            --arg description "$description" \
            --arg startDate "$startDate" \
            --arg endDate "$endDate" \
            --arg timeoutMechanismType "$timeoutMechanismType" \
            --arg penalty "$penalty" \
            --argjson circuits "$circuits_json" \
            '{
                "title": $title,
                "description": $description,
                "startDate": $startDate,
                "endDate": $endDate,
                "timeoutMechanismType": $timeoutMechanismType,
                "penalty": $penalty|tonumber,
                "circuits": $circuits
            }')

echo "$json" > p0tionConfig.json

prefix=$(echo "${title}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -dc '[:alnum:]-\n\r')

echo -e "\nCeremony json created. Please validate the p0tionConfig.json file before opening the PR. You can use phase2cli validate --template ./p0tionConfig.json"
echo -e "\nParameters such as start date and end date are set automatically to be 1 week from now and to end in 1 month from now. Please feel free to change them. The same applies to contribution time window and penalty."
echo -e "\nPlease open a PR named as $prefix and name the directory the same. The config file should be inside."

# cleanup
rm -r $tmp_dir