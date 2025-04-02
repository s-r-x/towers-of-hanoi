import { observer } from "mobx-react-lite";
import { RefreshCw as Refresh } from "lucide-react";
import { Info } from "lucide-react";
import { Plus } from "lucide-react";
import { Minus } from "lucide-react";
import { Footprints } from "lucide-react";
import { Undo2 as Undo } from "lucide-react";
import { Redo2 as Redo } from "lucide-react";
import { Stack, IconButton, HStack, Tag, NumberInput } from "@chakra-ui/react";
import { Tooltip } from "./components/ui/tooltip";
import type { tGameState } from "@/interfaces/game-state";
import { MAX_DISKS_COUNT, MIN_DISKS_COUNT } from "@/config/game";

export type tProps = {
  gameState: tGameState;
};
const BUTTON_SIZE = "xs";

const App = ({ gameState }: tProps) => {
  return (
    <Stack direction="row" alignItems="center" pb={1}>
      <HStack mr={4}>
        <Tooltip content="Undo">
          <IconButton
            size={BUTTON_SIZE}
            onClick={() => gameState.undoDiskMove()}
            disabled={!gameState.canUndoDiskMove}
          >
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip content="Redo">
          <IconButton
            size={BUTTON_SIZE}
            onClick={() => gameState.redoDiskMove()}
            disabled={!gameState.canRedoDiskMove}
          >
            <Redo />
          </IconButton>
        </Tooltip>
      </HStack>
      <Tooltip content="Info">
        <IconButton size={BUTTON_SIZE}>
          <Info />
        </IconButton>
      </Tooltip>
      <Tooltip content="Reset">
        <IconButton size={BUTTON_SIZE} onClick={() => gameState.reset()}>
          <Refresh />
        </IconButton>
      </Tooltip>
      <NumberInput.Root
        value={String(gameState.disksCount)}
        min={MIN_DISKS_COUNT}
        max={MAX_DISKS_COUNT}
        allowOverflow={false}
        onValueChange={(v) => gameState.changeDisksCount(v.valueAsNumber)}
        unstyled
        spinOnPress={false}
      >
        <HStack gap="1" mx={4}>
          <Tooltip content="Decrease amount of disks">
            <NumberInput.DecrementTrigger asChild>
              <IconButton size={BUTTON_SIZE}>
                <Minus />
              </IconButton>
            </NumberInput.DecrementTrigger>
          </Tooltip>
          <Tooltip content="Amount of disks">
            <NumberInput.ValueText
              textAlign="center"
              fontSize="lg"
              minW="3ch"
            />
          </Tooltip>
          <Tooltip content="Increase amount of disks">
            <NumberInput.IncrementTrigger asChild>
              <IconButton size={BUTTON_SIZE}>
                <Plus />
              </IconButton>
            </NumberInput.IncrementTrigger>
          </Tooltip>
        </HStack>
      </NumberInput.Root>
      <Tag.Root size="lg" p={2} ml="auto">
        <Tag.Label>{gameState.currentStep}</Tag.Label>
        <Tag.EndElement>
          <Footprints />
        </Tag.EndElement>
      </Tag.Root>
    </Stack>
  );
};

export default observer(App);
