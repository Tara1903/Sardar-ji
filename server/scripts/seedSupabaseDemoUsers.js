const { assertSupabaseConfigured, supabaseAdmin } = require('../src/config/supabase');
const { dataStore } = require('../src/services/dataStore');

const demoUsers = [
  {
    name: 'Sardar Ji Admin',
    email: 'admin@sardarji.local',
    password: 'Admin@123',
    phoneNumber: '9999999999',
    role: 'admin',
    addresses: [],
  },
  {
    name: 'Delivery Partner',
    email: 'delivery@sardarji.local',
    password: 'Delivery@123',
    phoneNumber: '8888888888',
    role: 'delivery',
    addresses: [],
  },
  {
    name: 'Happy Customer',
    email: 'customer@sardarji.local',
    password: 'Customer@123',
    phoneNumber: '7777777777',
    role: 'customer',
    addresses: [
      {
        id: 'address-demo-customer',
        name: 'Happy Customer',
        phoneNumber: '7777777777',
        fullAddress: 'Near Main Market, Bhopal',
        landmark: 'Opposite Bus Stand',
        pincode: '462001',
      },
    ],
  },
];

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const waitForProfile = async (userId, attempts = 12) => {
  for (let index = 0; index < attempts; index += 1) {
    const user = await dataStore.getUserById(userId);
    if (user) {
      return user;
    }

    await delay(200);
  }

  throw new Error(`User profile for ${userId} was not created in time.`);
};

const listAuthUsers = async () => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) {
    throw new Error(error.message || 'Unable to list auth users.');
  }

  return data.users || [];
};

const ensureUser = async (demoUser) => {
  const authUsers = await listAuthUsers();
  const existing = authUsers.find(
    (candidate) => candidate.email?.toLowerCase() === demoUser.email.toLowerCase(),
  );

  if (existing) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        name: demoUser.name,
        phoneNumber: demoUser.phoneNumber,
        role: demoUser.role,
      },
    });

    if (error) {
      throw new Error(error.message || `Unable to update ${demoUser.email}.`);
    }

    await waitForProfile(existing.id);
    await dataStore.updateUser(existing.id, {
      name: demoUser.name,
      phoneNumber: demoUser.phoneNumber,
      addresses: demoUser.addresses,
    });

    return { email: demoUser.email, id: existing.id, action: 'updated' };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: demoUser.email,
    password: demoUser.password,
    email_confirm: true,
    user_metadata: {
      name: demoUser.name,
      phoneNumber: demoUser.phoneNumber,
      role: demoUser.role,
    },
  });

  if (error || !data?.user?.id) {
    throw new Error(error?.message || `Unable to create ${demoUser.email}.`);
  }

  await waitForProfile(data.user.id);
  await dataStore.updateUser(data.user.id, {
    name: demoUser.name,
    phoneNumber: demoUser.phoneNumber,
    addresses: demoUser.addresses,
  });

  return { email: demoUser.email, id: data.user.id, action: 'created' };
};

const main = async () => {
  assertSupabaseConfigured();
  await dataStore.init();

  const results = [];
  for (const demoUser of demoUsers) {
    results.push(await ensureUser(demoUser));
  }

  console.log(JSON.stringify({ ok: true, users: results }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
