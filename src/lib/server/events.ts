import { Evt } from 'evt';
import type { KOFIDonation } from '../../types/Donation';
import type { UserWithSteamProfile } from './database/user';

interface DonationEventPayload {
  donation: KOFIDonation;
  steamUser: UserWithSteamProfile | null;
}

class EventHandlers {
  public readonly newDonationEvt = Evt.create<DonationEventPayload>();
}

export const eventHandlers = new EventHandlers();

eventHandlers.newDonationEvt.attach((donation) => {
  console.log('New donation!');
  console.log(donation);
});
