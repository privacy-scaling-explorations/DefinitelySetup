import React, { useState } from "react";
import {
  Button,
  HStack,
  Text,
} from "@chakra-ui/react";

export const Pagination: React.FC = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <HStack spacing={4} justifyContent="center" mt={4}>
      <Button onClick={handlePrevious} isDisabled={currentPage === 1}>
        Previous
      </Button>
      <Text>
        Page {currentPage} of {totalPages}
      </Text>
      <Button onClick={handleNext} isDisabled={currentPage === totalPages}>
        Next
      </Button>
    </HStack>
  );
};
