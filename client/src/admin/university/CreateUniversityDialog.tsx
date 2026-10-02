import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import type { University } from '../../types';
import { UniversityEditor } from '../UniversityEditor';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (university: University) => void;
};

export function CreateUniversityDialog({ open, onOpenChange, onCreated }: Props) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="cms-university-modal-overlay" />
      <Dialog.Content className="cms-university-modal" onInteractOutside={event => event.preventDefault()}>
        <div className="cms-university-modal-heading">
          <div><span className="cms-kicker">STUDY LISTINGS</span><Dialog.Title>Create university</Dialog.Title><Dialog.Description>Enter the institution, study, and publication details. Save a draft until the information has been verified.</Dialog.Description></div>
          <Dialog.Close className="cms-university-modal-close" aria-label="Close create university dialog"><X size={19} aria-hidden="true" /></Dialog.Close>
        </div>
        <UniversityEditor slug="new" presentation="dialog" onBack={() => onOpenChange(false)} onCreated={onCreated} />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
