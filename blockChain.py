import datetime;
import hashlib;

#every block is an instance of the block class
class Block:
    blockNo = 0 # every block has a number
    data = None # it has data
    next = None # pointer to the next block
    hash = None # hash of the block
    nonce = 0 # this finds how many times we needed to calculate the hash
    previous_hash = 0x0   # hash of the previous block, this is what makes the blockchain work
    timestamp = datetime.datetime.now()  #timestamp will help synchronize all of blocks in a network of blochchains

    # save the string data to the block
    def __init__(self, data):
        self.data = data

# to create the hash we add up nonce, data, previous_hash, block number and add all of them together as an string and then feed them to sha256 algorithm to make the hashcode
    def hash(self):
        h = hashlib.sha256()
        h.update(
        str(self.nonce).encode('utf-8') +
        str(self.data).endcode('utf-8') +
        str(self.previous_hash).encode('utf-8') +
        str(self.blockNo).encode('utf-8')
        )
        return h.hexdigest()

        def __str__(self):
            return "Block Hash: " + str(self.hash() + "\nBlockNo: " + str(self.blockNo) + "\nBlock Data: " + str(self.data) + "\nHashes: " + str(self.nonce) + "\n--------------")



class Blockchain:
    diff = 20
    maxNonce = 2**32  # here is the range that we allow for mining, how many times max we should repeat checking proccess(biggest 32 bit number)
    target = 2 ** (256-diff)  # here is the target number, by increasing the difference, we decrease the range of the target, therefore hashing (mining) will become harder

# this is the first block built into the blockchain
    block = Block("Genesis")

    # this will help how to implemetn linkedlist in python
    dummy = head = block

    # add a new block to the blockchain (needs a generated empty block)
    def add(self, block):
        # previous_hash of next block is hash of current one
        block.previous_hash = self.block.hash()

        # blockNo of next block is blockNo of current one + 1
        block.blockNo = self.block.blockNo + 1

        # add new block as next for current block
        self.block.next = block

        # then replace current block with next block
        self.block = self.block.next

# here is how the mining actually work :
    def mine(self, block):
        for n in range(self.maxNonce):
            # to determine if we should put hash of a block into the block chain we check if the hashnumber is smaller than a specific target number
            if int(block.hash(), 16) <= self.target:
                self.add(block)
                print(block)
                break
            else:
                # otherwise increase nonce
                block.nonce += 1



# here we instanciate our block chain class :
blockchain = Blockchain()

# this for loop generates 10 random blocks and gives them string data
for n in range(10):
    blockchain.mine(Block("Block" + str(n+1)))

# printing out each block in the blockchain
while blockchain.head != None:
    print(blockchain.head) # automatically calls str function of the block object
    blockchain.head = blockchain.head.next
