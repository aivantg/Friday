const tryPhone = async (frame, attempts = 1) => {
  for (let i = 0; i < attempts; i += 1) {
    await frame.click('.phone-label');
    console.log(`Calling phone..., attempt: ${i + 1}. Waiting 2 minutes...`);
    try {
      await frame.waitForNavigation({
        timeout: '120000',
      });
      console.log('Phone call succeeded!');
      return true;
    } catch {
      console.log('Phone call failed :(');
      try {
        await frame.waitForSelector('.btn-cancel', {
          timeout: '2000',
        });
        await frame.click('.btn-cancel');
        await frame.waitFor(3000);
      } catch {
        console.log("Couldn't cancel");
        return false;
      }
    }
  }
  return false;
};

const tryPush = async (page, frame, attempts = 1) => {
  for (let i = 0; i < attempts; i += 1) {
    await frame.waitForSelector(`.push-label`);
    await frame.click('.push-label');
    console.log(`Sent push, attempt: ${i + 1}. Waiting 55 seconds...`);
    try {
      await page.waitForNavigation({
        timeout: '55000',
      });
      console.log('Push succeeded!');
      return true;
    } catch (e) {
      console.log('Push Failed :(');
      try {
        await frame.waitForSelector('.btn-cancel', {
          timeout: '2000',
        });
        await frame.click('.btn-cancel');
        await frame.waitFor(3000);
      } catch {
        console.log("Couldn't cancel");
        return false;
      }
    }
  }
  return false;
};

const tryPasscode = async (page, frame, passcode) => {
  console.log(`Trying passcode: "${passcode}"...`);
  await frame.type('.passcode-input', passcode);
  await frame.waitForSelector('#passcode');
  await frame.click('#passcode');
  try {
    await page.waitForNavigation({ timeout: '3000' });
    console.log('Passcode succeeded!');
    return true;
  } catch {
    console.log('Passcode Failed');

    // Clear Input field
    await frame.click('.passcode-input', { clickCount: 3 });
    await page.keyboard.press('Backspace');

    return false;
  }
};

const authorize = async (page, username, password, passcodes = []) => {
  console.log('Logging in to CalCentral');
  await page.waitForSelector('#username');
  await page.type('#username', username);
  await page.waitFor(1000);
  await page.waitForSelector('#password');
  await page.type('#password', password);
  await page.click('#submit');
  await page.waitFor(10000);

  console.log('Finding DuoSecurity Frame');
  const frames = await page.frames();
  const duoFrame = frames.find((frame) => frame.url().includes('duosecurity'));
  await duoFrame.waitForSelector(`.push-label`);

  // Try passcode inputs
  console.log('Trying Passcodes...');
  let passcodeSuccess = false;
  await duoFrame.click('.passcode-label');
  for (let i = 0; i < passcodes.length; i += 1) {
    passcodeSuccess = await tryPasscode(page, duoFrame, passcodes[i]);
    if (passcodeSuccess) {
      return { success: true, method: 'passcode', passcode: i };
    }
  }

  // Try push notification update
  console.log('Tried all passcodes :(');
  console.log('Trying for push notification!');
  const pushSuccess = await tryPush(page, duoFrame);
  if (pushSuccess) {
    return { success: true, method: 'push' };
  }
  console.log('Resorting to phone call');
  const phoneSuccess = await tryPhone(duoFrame);
  if (phoneSuccess) {
    return { success: true, method: 'phone' };
  }
  console.log('Giving up on login :(');
  return { success: false };
};

export default authorize;
