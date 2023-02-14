# Unleash With Remote Segment

This repo is to demonstrate how Unleash can be used with a Segment that's too large to fit into memory/pipe over network.

``` What's missing in the original approach [here](https://github.com/sighphyre/UnleashAndRedis), is how the segments will be managed and synced with Unleash UI and how evaluation will happen in the proxy for front-end client side apps.  ```

## Prerequisites

Running the docker-compose will spin up Unleash, Postgres, Redis and a test application instances. This compose is built against the OSS version of Unleash so we'll be using a Constraint rather than a Segment but practically, the flow is the same. To see this in action you'll need to do the following
- I've changed the sample app, you've provided by adding a new strategy called ExternalSegment, the strategy would internally read the segement name from a paramater called SegmentName.. 
   and internally it would reach out Redis for checking if the current userId in the context part of the segement in the paramater.  

- Need to create a new strategy named ExternalSegment, add a paramater named SegmentName (which will have the name of the segment we would need to check in Redis).  The custom strategy would expect a paramater name called SegmentName, and would assume that the context has a userId that we need to evaluate against. 
  
- As you can see we would manually to enter the segment name in the activiation strategy... I wonder if there is away, we can create a segment and use that in the activiation strategy for being evaluated from the external source (Redis) In this case, we can automate creation of the segments using our internal systems... they would be just place holder for enabling better UI experience for our operation team.
 
  
Check the below screen shots for visualizing the UI
- [A screenshot of what the toggle configuration in Unleash should look like](strategy.PNG)
- [A screenshot of the custom strategy configuration in Uleash](strategy_creation.PNG).

Running the docker-compose will add two users to Redis (userId 7 and 8) and then query Unleash for userId 7,8 and 9. You should see the toggle enabled for only ID 7 and 8 in the output.

Hope that makes sense.
