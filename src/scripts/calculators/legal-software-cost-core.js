// Legal software cost comparison. Pure functions with no DOM access, so tests can import them directly.
// Every price is entered by the user; the model applies arithmetic only and never supplies vendor prices.

export const OPTIONS = ['a', 'b', 'c'];
export const GROUPS = [
  { legend: 'Your Firm', icon: 'users', fields: [
    { key: 'users', label: 'Number of users', help: 'Everyone who needs a paid seat.', type: 'int', min: 1, max: 10000 },
    { key: 'months', label: 'Months to compare', help: 'A whole number from 1 to 120. Contract length is a good choice.', type: 'int', min: 1, max: 120 },
    { key: 'hourValue', label: 'Value of one hour saved ($, optional)', help: 'For return on investment. Use a billing rate or staff cost you can defend.', type: 'money', optional: true }
  ] },
  ...OPTIONS.map((o, i) => ({ legend: `Option ${o.toUpperCase()}`, icon: ['device-laptop', 'target-arrow', 'bolt'][i], optional: i > 0, fields: [
    { key: `${o}.perUser`, label: 'Price per user per month ($)', help: i === 0 ? 'The plan price from the vendor page or quote.' : '', type: 'money' },
    { key: `${o}.flat`, label: 'Flat monthly fees ($)', help: i === 0 ? 'Firm-wide fees, add-ons, or a connected product. Enter 0 if none.' : '', type: 'money', optional: true },
    { key: `${o}.setup`, label: 'One-time setup and migration ($)', help: i === 0 ? 'Charged once at the start. Enter 0 if none.' : '', type: 'money', optional: true },
    { key: `${o}.hoursSaved`, label: 'Hours saved per user per month (optional)', help: i === 0 ? 'Your own estimate, ideally from a trial. Leave blank to skip return on investment.' : '', type: 'money', optional: true }
  ] }))
];

export function costOf(users, months, { perUser, flat = 0, setup = 0 }) {
  const monthly = perUser * users + flat;
  const total = monthly * months + setup;
  return { monthly, firstYear: monthly * Math.min(12, months) + setup, total, perUserMonth: total / months / users };
}

export function compute(v) {
  if (v.users === undefined || v.months === undefined) return { empty: 'Enter your users and months, then at least one option price.' };
  const ready = OPTIONS.filter(o => v[`${o}.perUser`] !== undefined);
  if (!ready.length) return { empty: 'Enter a price per user for at least one option.' };
  const res = Object.fromEntries(ready.map(o => [o, costOf(v.users, v.months, { perUser: v[`${o}.perUser`], flat: v[`${o}.flat`] ?? 0, setup: v[`${o}.setup`] ?? 0 })]));
  const sorted = [...ready].sort((x, y) => res[x].total - res[y].total);
  const best = sorted[0], worst = sorted[sorted.length - 1];
  const name = o => `Option ${o.toUpperCase()}`;
  // Return on investment only when the user supplies both an hour value and an hours-saved estimate for the option.
  const roi = Object.fromEntries(ready.filter(o => v.hourValue > 0 && v[`${o}.hoursSaved`] > 0).map(o => {
    const value = v[`${o}.hoursSaved`] * v.users * v.months * v.hourValue;
    const net = value - res[o].total;
    return [o, { value, net, pct: res[o].total > 0 ? net / res[o].total * 100 : null }];
  }));
  const roiKeys = Object.keys(roi);
  return {
    headline: { icon: 'cash', label: `Lowest total over ${v.months} months`, value: `${name(best)}: ${fmt.money(res[best].total)}` },
    tiles: [
      ['calendar-check', `${name(best)} per month`, fmt.money(res[best].monthly), `${v.users} users plus flat fees`],
      ['report-money', 'First-year cost', fmt.money(res[best].firstYear), 'Includes one-time setup'],
      ['users', 'Cost per user per month', fmt.money2(res[best].perUserMonth), 'Over the whole period, setup spread in'],
      ['scale', 'Gap to the highest option', ready.length > 1 ? fmt.money(res[worst].total - res[best].total) : 'Add another option', ready.length > 1 ? `${name(worst)} costs more over the period` : '']
    ],
    table: { caption: 'Option comparison', head: ['Option', 'Per month', 'First year', `${v.months}-month total`, 'Per user per month', ...(roiKeys.length ? ['Value of time saved', 'Net return', 'Return on cost'] : [])],
      rows: ready.map(o => [name(o), fmt.money(res[o].monthly), fmt.money(res[o].firstYear), fmt.money(res[o].total), fmt.money2(res[o].perUserMonth), ...(roiKeys.length ? (roi[o] ? [fmt.money(roi[o].value), fmt.money(roi[o].net), roi[o].pct === null ? 'n/a' : fmt.pct(roi[o].pct, 0)] : ['Not entered', '', '']) : [])]) },
    roi,
    formula: 'Monthly cost = price per user × users + flat monthly fees. Total = monthly cost × months + one-time setup. Cost per user per month = total ÷ months ÷ users.' + (roiKeys.length ? ' Value of time saved = hours saved per user per month × users × months × value of an hour. Net return = value − total cost. Return on cost = net return ÷ total cost.' : ''),
    summary: ready.map(o => `${name(o)}: ${fmt.money(res[o].monthly)} a month, ${fmt.money(res[o].total)} over ${v.months} months${roi[o] ? `; net return ${fmt.money(roi[o].net)} on your time-saved estimate` : ''}`),
    results: res
  };
}

export const EXAMPLE = { users: 5, months: 36, 'a.perUser': 39, 'a.flat': 0, 'a.setup': 0, 'b.perUser': 49, 'b.flat': 0, 'b.setup': 1500, 'c.perUser': 55, 'c.flat': 35, 'c.setup': 500 };

export const fmt = {
  money: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x),
  money2: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x),
  num: (x, d = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x),
  pct: (x, d = 2) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x)}%`
};
