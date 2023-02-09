

// Get all donations we had so far
import prisma from "./prisma";

export const getDonations = async () => {

    // Get the donations from the database
    const donations = await prisma.kOFIDonation.findMany({
      include: {
        UserKOFIDonation: true
      }
    })

    // Return the donations
    return donations;

}
