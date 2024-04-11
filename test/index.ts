import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { ExpTechApi } from '../src/api';

const API = suite('api');
const exptech = new ExpTechApi();

API("should return 1 PartialReport", async () => {
  const data = await exptech.getReports(1);
  assert.equal(data.length, 1);
});

API("should return 50 PartialReport", async () => {
  assert.equal((await exptech.getReports()).length, 50);
});

API("should return Report", async () => {
  assert.equal((await exptech.getReports()).length, 50);
});

API.run();