#!/bin/bash

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

echo "Welcome to DefinitelySetup p0tion config generator!"
echo "Please ensure that each pair of r1cs and wasm files have the same name. \n"

# Ask for AWS details
echo "Enter AWS region:"
read region
echo "Enter AWS profile:"
read profile
echo "Enter S3 bucket name:"
read bucket
echo "Enter the directory where the files are located:"
read directory

# Ask for top level information
echo "Enter title:"
read title
echo "Enter description:"
read description
echo "Enter start date (format 2023-07-24T13:00:00):"
read startDate
echo "Enter end date (format 2023-07-24T13:00:00):"
read endDate

timeoutMechanismType=""
while [[ "$timeoutMechanismType" != "FIXED" && "$timeoutMechanismType" != "DYNAMIC" ]]; do
  echo "Enter timeout mechanism type (FIXED/DYNAMIC):"
  read timeoutMechanismType
done

echo "Enter penalty in seconds (number > 0):"
read penalty

echo "Is the compiler the same for all circuits? (yes/no)"
read same_compiler

if [ "$same_compiler" = "yes" ]; then
    echo "Enter compiler version:"
    read compiler_version
    echo "Enter compiler commit hash:"
    read compiler_commit_hash
fi

echo "Is the template source and commit hash the same for all circuits? (yes/no)"
read same_template

if [ "$same_template" = "yes" ]; then
    echo "Enter template source:"
    read template_source
    echo "Enter template commit hash:"
    read template_commit_hash
fi

same_verification=""
while [[ "$same_verification" != "yes" && "$same_verification" != "no" ]]; do
    echo "Is the verification method the same for all circuits? (yes/no)"
    read same_verification
done

if [ "$same_verification" = "yes" ]; then
    verification_method=""
    while [[ "$verification_method" != "CF" && "$verification_method" != "VM" ]]; do
        echo "Enter verification method (CF/VM):"
        read verification_method
    done

    if [ "$verification_method" = "VM" ]; then
        echo "Enter VM configuration type:"
        read vm_configuration_type
        echo "Enter VM disk size (number):"
        read vm_disk_size
        echo "Enter VM disk type:"
        read vm_disk_type
    fi
fi

file_list=$(ls $directory/*.{r1cs,wasm})

echo "File list: $file_list"

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
    echo "Uploading $base_name.r1cs to $bucket in $region..."   
    aws s3 cp $base_name.r1cs s3://$bucket/ --acl public-read --profile $profile --region $region

    echo "Uploading $base_name.wasm to $bucket in $region..."
    aws s3 cp $base_name.wasm s3://$bucket/ --acl public-read --profile $profile --region $region

    # Get the file name only
    base_name=$(basename "${file_path%.*}")

    if [ "$same_compiler" = "no" ]; then
        echo "Enter compiler version:"
        read compiler_version
        echo "Enter compiler commit hash:"
        read compiler_commit_hash
    fi

    if [ "$same_template" = "no" ]; then
        echo "Enter template source:"
        read template_source
        echo "Enter template commit hash:"
        read template_commit_hash
    fi

    if [ "$same_verification" = "no" ]; then
        echo "Enter verification method (CF/VM):"
        read verification_method

        if [ "$verification_method" = "VM" ]; then
            echo "Enter VM configuration type:"
            read vm_configuration_type
            echo "Enter VM disk size (number):"
            read vm_disk_size
            echo "Enter VM disk type:"
            read vm_disk_type
        fi
    fi

    echo "Enter circuit description:"
    read circuit_description
    echo "Enter circuit name:"
    read circuit_name

    fixed_time_window=()
    dynamic_threshold=()

    if [ "$timeoutMechanismType" = "FIXED" ]; then 
        echo "Enter fixed time window in seconds:"
        read fixed_time_window
    else
        fixed_time_window=0
    fi 

    if [ "$timeoutMechanismType" = "DYNAMIC" ]; then 
        echo "Enter dynamic threshold in seconds:"
        read dynamic_threshold
    else
        dynamic_threshold=0
    fi

    echo "Enter paramConfiguration values as a comma-separated list (e.g. 6,8,3,2):"
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
            --arg circuit_name "$circuit_name" \
            --arg dynamic_threshold "$dynamic_threshold" \
            --arg fixed_time_window "$fixed_time_window" \
            --arg base_name "$base_name" \
            --argjson params "$params" \
            '{
                "description": $circuit_description,
                "compiler": {"version": $compiler_version, "commitHash": $compiler_commit_hash},
                "template": {"source": $template_source, "commitHash": $template_commit_hash, "paramConfiguration": $params},
                "verification": ($verification_method | if . == "CF" then {"cfOrVm": "CF"} else {"cfOrVm": "VM", "vmConfigurationType": $vm_configuration_type, "vmDiskSize": $vm_disk_size|tonumber, "vmDiskType": $vm_disk_type} end),
                "artifacts": {"bucket": $bucket, "region": $region, "r1csStoragePath": ($base_name + ".r1cs"), "wasmStoragePath": ($base_name + ".wasm")},
                "name": $circuit_name,
                "dynamicThreshold": $dynamic_threshold|tonumber,
                "fixedTimeWindow": $fixed_time_window|tonumber,
                "sequencePosition": $index|tonumber
            }')

    # append to the circuits array
    echo "Circuit JSON: $circuit"
    circuits_array+=("$circuit")
    echo "Circuits array: $circuits_array"

    index=$((index+1))
done

# convert bash array to json array
circuits_json=$(echo -e "${circuits_array[@]}" | tr ' ' '\n' | jq -s -c '.')
echo "Circuits JSON: $circuits_json"

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

echo "JSON: $json"

echo "$json" > p0tionConfig.json

prefix=$(echo "${title}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -dc '[:alnum:]-\n\r')

echo "Ceremony json created. Please validate the p0tionConfig.json file before opening the PR. You can use phase2cli validate --template ./p0tionConfig.json"
echo "Please open a PR named as $prefix and name the directory the same. The config file should be inside."
