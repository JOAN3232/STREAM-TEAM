export const CHARACTER_AVATARS = [
  {
    id: "nova",
    name: "Nova",
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
  {
    id: "aria",
    name: "Aria",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
  {
    id: "zuri",
    name: "Zuri",
    images: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
  {
    id: "maya",
    name: "Maya",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
  {
    id: "kai",
    name: "Kai",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
  {
    id: "ace",
    name: "Ace",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
  {
    id: "leo",
    name: "Leo",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
  {
    id: "noah",
    name: "Noah",
    images: [
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=500&h=500&q=90",
    ],
  },
];

export function getProfileAvatar(avatarId) {
  return (
    CHARACTER_AVATARS.find(
      (avatar) => avatar.id === avatarId
    ) || CHARACTER_AVATARS[0]
  );
}