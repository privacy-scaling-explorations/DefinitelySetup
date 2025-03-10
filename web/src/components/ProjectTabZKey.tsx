import {
  Box,
  Text,
  TabPanel,
  Button,
  useClipboard,
} from "@chakra-ui/react";
import { FaCloudDownloadAlt, FaCopy } from "react-icons/fa";

import { useProjectPageContext } from "../context/ProjectPageContext";
import { CeremonyState } from "../helpers/interfaces";
import { truncateString } from "../helpers/utils";

export const ProjectTabZKey: React.FC = ({ project }) => {
  const {
    latestZkeys,
    finalBeacon,
    finalZkeys,
  } = useProjectPageContext();

  const beaconValue = finalBeacon?.beacon
  const beaconHash = finalBeacon?.beaconHash

  const { onCopy: copyBeaconValue, hasCopied: copiedBeaconValue } = useClipboard(beaconValue || "")
  const { onCopy: copyBeaconHash, hasCopied: copiedBeaconHash } = useClipboard(beaconHash || "")

  return (
    <TabPanel textAlign={"center"}>
      {
        project?.ceremony.data.state === CeremonyState.FINALIZED && beaconHash && beaconValue &&
        <div>
          <Text fontSize={14} fontWeight="bold">
          Final contribution beacon
          </Text>
          <Button
            margin={4}
            leftIcon={<Box as={FaCopy} w={3} h={3} />}
            variant="outline"
            fontSize={12}
            fontWeight={"regular"}
            onClick={copyBeaconValue}
          >
            {
              copiedBeaconValue ?
              "Copied"
              : `Beacon ${finalBeacon?.beacon}`
            }
          </Button>
          <Button
            margin={4}
            leftIcon={<Box as={FaCopy} w={3} h={3} />}
            variant="outline"
            fontSize={12}
            fontWeight={"regular"}
            onClick={copyBeaconHash}
          >
            {
              copiedBeaconHash ?
              "Copied"
              : `Beacon hash ${truncateString(finalBeacon?.beaconHash)}`
            }
          </Button>
        </div>
      }
      <Text p={4} fontSize={14} fontWeight="bold">
        Download Final ZKey(s)
      </Text>
      <Text color="gray.500">
        Press the button below to download the final ZKey files from the S3 bucket.
      </Text>
      {
        finalZkeys?.map((zkey, index) => {
          return (
            <a
              href={zkey.zkeyURL}
              key={index}
            >
              <Button
                margin={"20px"}
                leftIcon={<Box as={FaCloudDownloadAlt} w={3} h={3} />}
                fontSize={12}
                variant="outline"
                fontWeight={"regular"}
                isDisabled={
                  project?.ceremony.data.state !== CeremonyState.FINALIZED ? true : false
                }
              >
              Download {zkey.zkeyFilename}
            </Button>
          </a>
          )
        })
      }
      {
        project?.ceremony.data.state === CeremonyState.FINALIZED &&
        <>
          <Text p={4} fontSize={14} fontWeight="bold">
          Download Last ZKey(s)
          </Text>
          <Text color="gray.500">
            You can use this zKey(s) with the beacon value to verify that the final zKey(s) was computed correctly.
          </Text>
          {
            latestZkeys?.map((zkey, index) => {
              return (
                <a
                  href={zkey.zkeyURL}
                  key={index}
                >
                  <Button
                    margin={"20px"}
                    key={index}
                    leftIcon={<Box as={FaCloudDownloadAlt} w={3} h={3} />}
                    fontSize={12}
                    variant="outline"
                    fontWeight={"regular"}
                    isDisabled={
                      project?.ceremony.data.state !== CeremonyState.FINALIZED ? true : false
                    }
                  >
                    Download {zkey.zkeyFilename}
                  </Button>
                </a>
              )
            })
          }
        </>
      }
    </TabPanel>
  );
}

