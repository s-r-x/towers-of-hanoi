import { Info } from "lucide-react";
import {
  Dialog,
  IconButton,
  Portal,
  CloseButton,
  Button,
} from "@chakra-ui/react";

export const GameDescriptionDialog = () => {
  return (
    <Dialog.Root size="md">
      <Dialog.Trigger asChild>
        <IconButton size="xs" title="Description">
          <Info />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Description</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>
                The Towers of Hanoi is one of the most famous classic problems
                every budding computer scientist must grapple with. Legend has
                it that in a temple in the Far East, priests are attempting to
                move a stack of golden disks from one diamond peg to another.
                The initial stack has 64 disks threaded onto one peg and
                arranged from bottom to top by decreasing size. The priests are
                attempting to move the stack from one peg to another under the
                constraints that exactly one disk is moved at a time and at no
                time may a larger disk be placed above a smaller disk. Three
                pegs are provided, one being used for temporarily holding disks.
                Supposedly, the world will end when the priests complete their
                task, so there is little incentive for us to facilitate their
                efforts.
              </p>
              <p>
                Let’s assume that the priests are attempting to move the disks
                from peg 1 to peg 3.
              </p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button>Got it</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
export default GameDescriptionDialog;
