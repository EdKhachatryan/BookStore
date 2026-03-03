export interface ConfirmDialogVm {
  titleKey: string;
  messageKey: string;
  messageParams?: Record<string, unknown>;

  cancelKey: string;
  confirmKey: string;

  confirmIsDestructive?: boolean;
}
