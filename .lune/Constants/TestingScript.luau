--!optimize 2
--!strict

local TESTING_SCRIPT = [=[import ProfileService from ".";

const Players = game.GetService("Players");

enum ProfileNumericField {
	Age = "age",
	UserId = "userId",
}
const enum ProfileStringField {
	DisplayName = "displayName",
	Name = "name",
}

type ProfileNumerics = Readonly<Record<ProfileNumericField, number>>;
type ProfileStrings = Readonly<Record<ProfileStringField, string>>;

interface ProfileStringsSafe {
	readonly displayName: string;
	readonly name: string;
}

interface ProfileStatistics {
	readonly coins: number;
	readonly experience: number;
}

type ProfileFriends = ReadonlyArray<number>;

interface ProfileData {
	readonly friends: ProfileFriends;
	readonly numerics: ProfileNumerics;
	readonly playTimes: number;
	readonly statistics: ProfileStatistics;
	readonly strings: ProfileStrings;
	readonly stringsSafe: ProfileStringsSafe;
}

const profileStore = ProfileService.GetProfileStore<ProfileData>("Profiles", {
	friends: [],
	numerics: {
		[ProfileNumericField.Age]: 0,
		[ProfileNumericField.UserId]: 0,
	},
	playTimes: 0,
	statistics: {
		coins: 0,
		experience: 0,
	},
	strings: {
		[ProfileStringField.DisplayName]: "",
		[ProfileStringField.Name]: "",
	},
	stringsSafe: {
		displayName: "",
		[ProfileStringField.Name]: "",
	},
});

async function _testAsync(player: Player): Promise<void> {
	const playerProfile = await profileStore.LoadProfileAsync(tostring(player.UserId), "ForceLoad");
	if (!playerProfile) {
		player.Kick("Missing data!");
		return;
	}

	playerProfile.AddUserId(player.UserId);
	playerProfile.Reconcile();

	if (player.Parent !== Players) {
		playerProfile.Release();
		return;
	}

	playerProfile.SetToPath("numerics.age", player.AccountAge); // should work.
	playerProfile.SetToPath(`numerics.${ProfileNumericField.UserId}`, player.UserId); // should work.

	{
		const namePath = `strings.${ProfileStringField.Name as const}` as const;
		playerProfile.SetToPath(namePath, player.Name); // should work.
		playerProfile.SetToPath("strings.name", player.Name); // should work.
		playerProfile.SetToPath("strings.displayName", player.DisplayName); // should work.
	}

	{
		const namePath = `stringsSafe.${ProfileStringField.Name as const}` as const;
		playerProfile.SetToPath(namePath, player.Name); // should work.
		playerProfile.SetToPath(`stringsSafe.${ProfileStringField.Name}`, player.Name); // should work.
		playerProfile.SetToPath("stringsSafe.name", player.Name); // should work.
	}

	playerProfile.SetToPath("statistics.coins", playerProfile.Data.statistics.coins + 100);
	playerProfile.SetToPath("statistics.experience", playerProfile.Data.statistics.experience + 20);
	playerProfile.SetToPath("playTimes", playerProfile.Data.playTimes + 1);
}]=]

return TESTING_SCRIPT
