import { FormControl } from "@mui/material";
import { Button, ButtonGroup, LegacyStack, Page, Text } from "@shopify/polaris";
import { useCallback, useState } from "react";

export default function Configuration() {
  const [isFirstButtonActive, setIsFirstButtonActive] = useState(true);

  const handleFirstButtonClick = useCallback(() => {
    if (isFirstButtonActive) return;
    setIsFirstButtonActive(true);
  }, [isFirstButtonActive]);

  const handleSecondButtonClick = useCallback(() => {
    if (!isFirstButtonActive) return;
    setIsFirstButtonActive(false);
  }, [isFirstButtonActive]);

  return (
    <>
      <LegacyStack vertical>
        <Text variant="headingXl" as="h4" color="success" fontWeight="bold">Enable or disable your App </Text>
        <ButtonGroup>
          <Button pressed={isFirstButtonActive} onClick={handleFirstButtonClick}>
            Enable
          </Button>
          <Button pressed={!isFirstButtonActive} onClick={handleSecondButtonClick}>
            Disable
          </Button>
        </ButtonGroup>
      </LegacyStack>
    </>
  )
}
