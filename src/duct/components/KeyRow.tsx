import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps } from "@duct-ui/core/blueprint"
import KeyCap from "./KeyCap"
import type { Key } from "@models/key"

// Props for KeyRow component
export interface KeyRowProps {
  keys: readonly Key[]
  screenHeight: "TALL" | "MEDIUM" | "TINY"
}

// Events emitted by KeyRow
export interface KeyRowEvents extends BaseComponentEvents {}

// Component logic
export interface KeyRowLogic {}

function render(props: BaseProps<KeyRowProps>) {
  const { keys, screenHeight, ...rest } = props

  return (
    <div class="key-row" style="display: flex; flex-direction: row; justify-content: center; flex-wrap: nowrap;" {...renderProps(rest)}>
      {keys.map(key => (
        <KeyCap keyCap={key} screenHeight={screenHeight} />
      ))}
    </div>
  )
}

const KeyRow = createBlueprint<KeyRowProps, KeyRowEvents, KeyRowLogic>(
  { id: "fourdle/keyrow" },
  render,
  {}
)

export default KeyRow
