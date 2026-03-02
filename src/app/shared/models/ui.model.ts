export interface ConfirmDialogVm {
  titleKey: string;
  messageKey: string;
  messageParams?: Record<string, unknown>;
  confirmKey: string;
  cancelKey: string;
  confirmIsDestructive?: boolean;
}
