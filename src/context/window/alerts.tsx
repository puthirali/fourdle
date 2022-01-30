import * as React from "react"

export interface AlertState {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export interface AlertStates {
  done: AlertState
  badEntry: AlertState
}

export type AlertType = "DONE" | "BAD_ENTRY"

export interface IAlertContext {
  setAlertIsOpen: (mt: AlertType, isOpen: boolean) => void
  isAlertOpen: (mt: AlertType) => boolean
}

export const AlertContext = React.createContext<IAlertContext>({
  setAlertIsOpen: () => {
    // template
  },
  isAlertOpen: () => {
    return true
  },
})

export type UseAlertResult = [boolean, (o: boolean) => void]

export const useAlert = (alert: AlertType): UseAlertResult => {
  const {setAlertIsOpen, isAlertOpen} = React.useContext(AlertContext)
  return [
    isAlertOpen(alert),
    (isOpen: boolean) => setAlertIsOpen(alert, isOpen),
  ]
}

export interface AlertProps {
  readonly children: React.ReactNode
}

export const ProvideAlerts: React.FC<AlertProps> = ({children}) => {
  const [doneOpen, setDoneOpen] = React.useState(false)
  const [errorOpen, setErrorOpen] = React.useState(false)
  const alertContext: IAlertContext = React.useMemo(
    () => ({
      setAlertIsOpen: (m: AlertType, isOpen: boolean) => {
        switch (m) {
          case "DONE":
            setDoneOpen(isOpen)
            break
          case "BAD_ENTRY":
            setErrorOpen(isOpen)
            break
        }
      },
      isAlertOpen: (m: AlertType) => {
        switch (m) {
          case "DONE":
            return doneOpen
          case "BAD_ENTRY":
            return errorOpen
        }
      },
    }),
    [doneOpen, errorOpen],
  )
  return (
    <AlertContext.Provider value={alertContext}>
      {children}
    </AlertContext.Provider>
  )
}
