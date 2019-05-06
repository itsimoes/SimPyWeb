import itertools
import random
import simpy

RANDOM_SEED = 42
SIM_TIME = 120
queueTime = 3
queueUsage = 0
clients = 0
exits = 0
arrivalTime = 10

fork = 1

def arrivals(env, arrivalTime):

	global clients

	while True:

		clients += 1

		 # Arrivals
		yield env.timeout(arrivalTime) # Time between arrivals
		
		
		 # Queue
		env.process(queue(env,clients,queues))	
		 

def queue(env,clients,queues) :

	global exits, queueUsage
	


	exits += 1

# Setup and start the simulation
print('Queue Simulation!')
random.seed(RANDOM_SEED)

# Create environment and start processes
env = simpy.Environment()
queues = simpy.Resource(env, capacity=fork)
env.process(arrivals(env,arrivalTime))

env.run(until=SIM_TIME)

queuePercentage = 100*queueTime*queueUsage/SIM_TIME
averageTime = SIM_TIME/exits
arrivalsTotal = clients/SIM_TIME
arrivalsPercentage = 100*arrivalsTotal
clients-=1

# Execute!
print("Simulation Complete!")
print("Arrivals: %d" %clients)
print("Departures: %d" %exits)
print("Average time per client %d" %averageTime)
print("Queue Time Percentage: %.1f %%" %queuePercentage)
