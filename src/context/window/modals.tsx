import * as React from "react"

export interface ModalState {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export interface ModalStates {
  settings: ModalState
  help: ModalState
  summary: ModalState
}

export type ModalType = "SETTINGS" | "HELP" | "SUMMARY"

export interface IModalContext {
  setModalIsOpen: (mt: ModalType, isOpen: boolean) => void
  isModalOpen: (mt: ModalType) => boolean
}

export const ModalContext = React.createContext<IModalContext>({
  setModalIsOpen: () => {
    // template
  },
  isModalOpen: () => {
    return true
  },
})

export type UseModalResult = [boolean, (o: boolean) => void]

export const useModal = (modal: ModalType): UseModalResult => {
  const {setModalIsOpen, isModalOpen} = React.useContext(ModalContext)
  return [
    isModalOpen(modal),
    (isOpen: boolean) => setModalIsOpen(modal, isOpen),
  ]
}

export interface ModalProps {
  readonly children: React.ReactNode
}

export const ProvideModals: React.FC<ModalProps> = ({children}) => {
  const [settingsOpen, setSettingsIsOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [summaryOpen, setSummaryOpen] = React.useState(false)
  const modalContext: IModalContext = React.useMemo(
    () => ({
      setModalIsOpen: (m: ModalType, isOpen: boolean) => {
        switch (m) {
          case "SETTINGS":
            setSettingsIsOpen(isOpen)
            break
          case "HELP":
            setHelpOpen(isOpen)
            break
          case "SUMMARY":
            setSummaryOpen(isOpen)
            break
        }
      },
      isModalOpen: (m: ModalType) => {
        switch (m) {
          case "SETTINGS":
            return settingsOpen
          case "HELP":
            return helpOpen
          case "SUMMARY":
            return summaryOpen
        }
      },
    }),
    [helpOpen, settingsOpen, summaryOpen],
  )
  return (
    <ModalContext.Provider value={modalContext}>
      {children}
    </ModalContext.Provider>
  )
}
