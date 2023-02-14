import { createClient } from "redis";
import { initialize, Strategy } from "unleash-client";

const SEGMENT_NAME = "someSegmentOfUsers"; // We'll be using "someSegmentOfUsers" but the name is arbitrary
const TOKEN = "*:development:some-secret"; // Prepopulated in the docker compose
const USERS_TO_QUERY = [7, 8, 9];

class ExternalSegment extends Strategy {
  constructor(redisLayer) {
    super('ExternalSegment');
    this.redisLayer = redisLayer;
  }

  async isEnabled(parameters, context) {
    console.log(`Paramaters: ${JSON.stringify(parameters)}, Context: ${ JSON.stringify(context)}`);
    var inSegment = await this.redisLayer.isInSegment(parameters.SegmentName, context.userId);
    console.log(`Segment Name: ${parameters.SegmentName}, UserId: ${ context.userId}, and evaluation is: ${inSegment}`);
    return await this.redisLayer.isInSegment(parameters.SegmentName, context.userId);
  }
}

class RedisLayer {
  constructor() {
    this.client = createClient({
      url: "redis://redis",
    });
  }

  async connect() {
    await this.client.connect();
    this.client.on("error", (err) => console.log("Redis Client Error", err));
  }

  async addToSegment(segmentName, userId) {
    await this.client.sAdd(segmentName, userId.toString());
  }

  async isInSegment(segmentName, userId) {
    console.log(`Redis: before sending ${segmentName}, ${userId.toString()}`);
    return this.client.sIsMember(segmentName, userId);
  }

  async setup() {
    await this.addToSegment(SEGMENT_NAME,  7);
    await this.addToSegment(SEGMENT_NAME, 8);
  }
}


let redisLayer = new RedisLayer();
await redisLayer.connect();
await redisLayer.setup(); // Don't do this in prod, this is to populate our users in Redis, practically, this would be handled by another system


const unleash = initialize({
  url: "http://unleash:4242/api",
  appName: "some-app-name",
  customHeaders: { Authorization: TOKEN },
  strategies: [new ExternalSegment(redisLayer)]
});

// End setup code, below is how this would be used

async function pollUnleash() {

  for (const userId of USERS_TO_QUERY) {
    const unleashContext = {
      userId: userId.toString()
    };
    
    const isEnabled = unleash.isEnabled("test-toggle", unleashContext);

    console.log(
      `Toggle test-toggle is enabled? ${isEnabled} for userId ${userId}`
    );
  }
  await new Promise((_resolve) => setTimeout(pollUnleash, 1000));
}

await pollUnleash();
