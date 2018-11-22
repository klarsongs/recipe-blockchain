import datetime
import hashlib

#every block is an instance of the block class
class Block:

    # save the string data to the block
    def __init__(self, data):
        self.blockNo = 0  # every block has a number
        self.data = data  # it has data
        self.next = None  # pointer to the next block
        # self.hash = None  # hash of the block - shoud be always calculated
        self.nonce = 0  # this finds how many times we needed to calculate the hash
        self.previous_hash = 0x0  # hash of the previous block, this is what makes the blockchain work
        self.timestamp = datetime.datetime.now()  # timestamp will help synchronize all of blocks in a network of blochchains

    # to create the hash we add up nonce, data, previous_hash, block number and add all of them together as an string and then feed them to sha256 algorithm to make the hashcode
    def hash(self):
        h = hashlib.sha256()
        h.update(
            str(self.nonce).encode('utf-8') +
            str(self.data).encode('utf-8') +
            str(self.previous_hash).encode('utf-8') +
            str(self.blockNo).encode('utf-8') +
            str(self.timestamp).encode('utf-8') # Adiz - I think we should use also the timestamp during calculation so that eg. timestamp couldn't be changed as well.
        )
        return h.hexdigest()

    def __str__(self):
        return "Block Hash: " + str(self.hash() + "\nBlockNo: " + str(self.blockNo) + "\nBlock Data: " + str(self.data) + "\nHashes: " + str(self.nonce) + "\n--------------")


class Blockchain:

    def __init__(self):
        self.diff = 20
        self.maxNonce = 2**32  # here is the range that we allow for mining, how many times max we should repeat checking proccess(biggest 32 bit number)
        self.target = 2 ** (256 - self.diff)  # here is the target number, by increasing the difference, we decrease the range of the target, therefore hashing (mining) will become harder

        # this is the first block built into the blockchain
        self.head = Block("Genesis")
        # this will help how to implemetn linkedlist in python
        self.dummy = self.tail = self.head

    # add a new block to the blockchain (needs a generated empty block)
    def add(self, block):
        # previous_hash of next block is hash of current one
        block.previous_hash = self.tail.hash()

        # blockNo of next block is blockNo of current one + 1
        block.blockNo = self.tail.blockNo + 1

        # add new block as next for current block
        self.tail.next = block

        # then replace current block with next block
        self.tail = self.tail.next

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


# If ran this file directly, call test function. Need to not call it every time we will import this file somewhere
def test():
    # here we instanciate our block chain class :
    blockchain = Blockchain()

    # this for loop generates 10 random blocks and gives them string data
    for n in range(10):
        blockchain.mine(Block("Block" + str(n+1)))

    # printing out each block in the blockchain / added separate variable, because previous assignement block.head = would everwrite the original head (probably?)
    head = blockchain.head
    while head != None:
        print(head) # automatically calls str function of the block object
        head = head.next

if __name__ == '__main__':
    test()