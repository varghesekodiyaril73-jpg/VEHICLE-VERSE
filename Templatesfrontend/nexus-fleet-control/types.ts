export type AuthMode = 'login' | 'register' | null;

export interface NavProps {
  onOpenAuth: (mode: AuthMode) => void;
}

export interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}
