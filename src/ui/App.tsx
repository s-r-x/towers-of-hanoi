import { observer } from "mobx-react-lite";
import { RefreshCw as Refresh } from "lucide-react";
import {
  Plus,
  Minus,
  Footprints,
  Undo2 as Undo,
  Redo2 as Redo,
  Settings,
} from "lucide-react";
import {
  Stack,
  IconButton,
  HStack,
  Tag,
  NumberInput,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { Tooltip } from "./components/ui/tooltip";
import { MAX_DISKS_COUNT, MIN_DISKS_COUNT } from "@/config/game";
import type { tGameState } from "@/interfaces/game-state";
import type { tUiState } from "@/interfaces/ui-state";
import { useCallback } from "react";
import GameDescriptionDialog from "./components/game-description-dialog";
import _ from "lodash";

export type tProps = {
  gameState: tGameState;
  uiState: tUiState;
};
const BUTTON_SIZE = "xs";

const App = ({ gameState, uiState }: tProps) => {
  const isEndGame = gameState.gameCondition === "finished";
  // chakra's checkbox item onCheckedChange callback fires twice on every change (version 3.15.0)
  const onShowDiskWeightChange = useCallback(
    _.debounce((value) => {
      uiState.changeShowDiskWeight(value);
    }, 100),
    [uiState.changeShowDiskWeight],
  );
  return (
    <Stack direction="row" alignItems="center" pb={1}>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton title="Settings" size={BUTTON_SIZE}>
            <Settings />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.ItemGroup>
                <Menu.CheckboxItem
                  disabled={isEndGame}
                  value="showDiskWeight"
                  checked={uiState.showDiskWeight}
                  onCheckedChange={onShowDiskWeightChange}
                >
                  <span>Show disk weight</span>
                  <Menu.ItemIndicator />
                </Menu.CheckboxItem>
              </Menu.ItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <HStack mr={4}>
        <Tooltip content="Undo">
          <IconButton
            size={BUTTON_SIZE}
            onClick={() => gameState.undoDiskMove()}
            disabled={!gameState.canUndoDiskMove || isEndGame}
          >
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip content="Redo">
          <IconButton
            size={BUTTON_SIZE}
            onClick={() => gameState.redoDiskMove()}
            disabled={!gameState.canRedoDiskMove || isEndGame}
          >
            <Redo />
          </IconButton>
        </Tooltip>
      </HStack>
      <GameDescriptionDialog />
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
