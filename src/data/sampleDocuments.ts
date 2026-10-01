import { DocumentItem } from '../types';
import { chunkDocument } from '../lib/tfidf';

const OS_TEXT = `
# Operating Systems: Virtual Memory, Paging, and Concurrency

## Section 1: Virtual Memory Architecture and Address Translation
Virtual memory is a memory management technique that provides an "idealized abstraction of the storage resources that are actually available on a given machine". It creates the illusion to users of a very large memory space, allowing processes to execute without requiring the entire program to reside in physical RAM at once.

The CPU generates virtual addresses consisting of a Virtual Page Number (VPN) and a Page Offset. The Memory Management Unit (MMU) translates this VPN into a Physical Frame Number (PFN). Because physical memory access is relatively fast compared to disk, address translation must be instantaneous. A specialized hardware cache known as the Translation Lookaside Buffer (TLB) stores recent VPN-to-PFN mappings. When a virtual address is referenced, the MMU first checks the TLB (TLB Hit). If the entry is found, the physical address is constructed immediately without consulting the page table in main memory. If a TLB Miss occurs, the hardware or operating system must perform a page table walk to resolve the address and load the entry into the TLB.

## Section 2: Page Tables, Page Faults, and Thrashing
Modern operating systems use multi-level page tables (such as 4-level or 5-level paging in x86-64) or inverted page tables to reduce memory overhead for sparse virtual address spaces. In a hierarchical page table, unused branches do not need to be allocated in memory.

When a process accesses a virtual page whose Present/Valid bit in the page table is set to 0, hardware raises an interrupt known as a Page Fault exception. The OS kernel traps the fault, checks the validity of the virtual address in the process's Virtual Memory Areas (VMAs), allocates a physical frame from the free frame list, and initiates an asynchronous I/O operation to read the page from swap storage or disk. Once disk I/O completes, the page table is updated with the new PFN, the valid bit is set, and the faulting instruction is restarted transparently.

Thrashing occurs when the total memory demand of all active processes exceeds available physical RAM. In this state, pages are constantly being evicted and re-read from disk, causing the system to spend virtually all its CPU cycles waiting on swap disk I/O rather than executing useful work. The Working Set Model, formulated by Peter Denning, monitors the set of pages referenced by a process within a sliding window of virtual time to prevent thrashing.

## Section 3: Process Synchronization, Mutexes, and Semaphores
When multiple concurrent threads access shared state without synchronization, race conditions arise where the final state depends on the non-deterministic interleaving of instructions. To prevent data corruption, critical sections must satisfy mutual exclusion, progress, and bounded waiting.

A Mutex (Mutual Exclusion lock) is a binary lock object that guarantees only one thread holds ownership at any given time. If a thread attempts to acquire a locked mutex, it will block (sleep) or spin. A Semaphore, invented by Edsger Dijkstra, is a generalized integer synchronization primitive with two atomic operations: wait() (also known as P) and signal() (also known as V). A counting semaphore initialized to N allows up to N concurrent threads to enter a resource pool.

## Section 4: Deadlocks, Coffman Conditions, and Banker's Algorithm
A deadlock is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process in the set.
According to the four Coffman Conditions, a deadlock can occur if and only if all four conditions hold simultaneously:
1. Mutual Exclusion: At least one resource is held in a non-shareable mode.
2. Hold and Wait: A process is holding at least one resource and requesting additional resources that are currently being held by other processes.
3. No Preemption: Resources cannot be forcibly seized from a process; they can only be released voluntarily.
4. Circular Wait: A closed chain of processes exists such that each process holds one resource that is needed by the next process in the chain.

Deadlock avoidance is achieved using the Banker's Algorithm, developed by Edsger Dijkstra. By maintaining state vectors of Available, Allocation, Max, and Need matrices, the algorithm checks whether allocating a requested resource leaves the system in a "Safe State"—a state from which there exists at least one execution sequence (safe sequence) allowing all processes to finish without deadlocking.
`;

const ML_TEXT = `
# Deep Learning & Transformers: Attention Mechanisms and Optimization

## Section 1: The Transformer Architecture and Self-Attention
Introduced in the seminal 2017 paper "Attention Is All You Need" by Vaswani et al., the Transformer revolutionized Natural Language Processing and deep learning by replacing recurrent neural networks (RNNs) with pure self-attention mechanisms. Unlike RNNs, which process sequences sequentially and suffer from catastrophic forgetting and slow training times, Transformers allow full parallelization across the entire sequence length.

Self-attention computes a representation of a sequence by relating different positions of the same sequence. For an input sequence represented as an embedding matrix X, the model projects X using three learned weight matrices: W_Q, W_K, and W_V to produce Query (Q), Key (K), and Value (V) matrices.

## Section 2: Scaled Dot-Product Attention and Multi-Head Attention
The fundamental attention formula is Scaled Dot-Product Attention:
Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V

Here, Q and K are multiplied to produce an attention score matrix representing the affinity between each token and all other tokens in the sequence. The dot product is divided by the square root of the dimension of the key vectors (sqrt(d_k)). This scaling factor is critical: for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients (vanishing gradient problem). The scaling factor counteracts this effect and stabilizes backpropagation.

Multi-Head Attention projects Queries, Keys, and Values h times with different learned linear projections into lower-dimensional subspaces. This allows the model to jointly attend to information from different representation subspaces at different positions—for example, one head might track syntactic dependencies, while another tracks long-range co-reference.

## Section 3: Positional Encodings and Residual Connections
Because self-attention contains no inherent sense of word order or sequential geometry (it is permutation-invariant), the Transformer must inject positional information. In the original architecture, sinusoidal positional encodings of varying frequencies are added directly to the input token embeddings:
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
Modern architectures also employ learned positional embeddings, ALiBi (Attention with Linear Biases), or Rotary Position Embeddings (RoPE) which encode relative distances between tokens via complex rotation matrices.

Each sub-layer (multi-head attention and position-wise feedforward network) is surrounded by a residual connection (skip connection) followed by Layer Normalization: Output = LayerNorm(x + Sublayer(x)). Residual connections prevent vanishing gradients in deep networks by providing an unimpeded highway for backpropagating gradients directly through the layer stack.

## Section 4: Optimization, Loss Functions, and Gradient Descent
Training deep transformer models requires specialized optimization techniques. Cross-Entropy Loss with label smoothing is standard for autoregressive language modeling. Optimization is predominantly conducted using AdamW (Adam with decoupled weight decay), which computes adaptive learning rates for each parameter based on first-moment (mean) and second-moment (uncentered variance) estimates of the gradients. Learning rate schedules typically incorporate a linear warmup phase followed by cosine decay to ensure stable convergence.
`;

const BIO_TEXT = `
# Biochemistry & Cellular Respiration: Glycolysis, Krebs Cycle, and ATP Synthesis

## Section 1: Overview of Cellular Respiration and Catabolism
Cellular respiration is the primary biochemical pathway by which aerobic organisms extract chemical energy stored in nutrient molecules (predominantly glucose, C6H12O6) and convert it into adenosine triphosphate (ATP), the universal energy currency of biological cells. The overall balanced chemical equation is:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~30 to 32 ATP

The complete catabolic process unfolds across four sequential stages:
1. Glycolysis (occurring in the cytosol)
2. Pyruvate Oxidation (occurring in the mitochondrial matrix)
3. The Citric Acid Cycle / Krebs Cycle (occurring in the mitochondrial matrix)
4. Oxidative Phosphorylation consisting of the Electron Transport Chain and Chemiosmosis (occurring across the inner mitochondrial membrane).

## Section 2: Glycolysis - The Cytosolic Splitting of Glucose
Glycolysis does not require oxygen and consists of 10 enzyme-catalyzed reactions divided into two distinct phases:
- The Energy Investment Phase: Two ATP molecules are consumed by hexokinase and phosphofructokinase-1 (PFK-1) to phosphorylate glucose into fructose-1,6-bisphosphate, trapping the sugar inside the cell and destabilizing it for cleavage. PFK-1 represents the key rate-limiting, allosterically regulated enzyme of glycolysis.
- The Energy Payoff Phase: Fructose-1,6-bisphosphate is cleaved into two 3-carbon triose phosphates (DHAP and G3P). Each G3P molecule undergoes oxidation and substrate-level phosphorylation, generating 4 ATP molecules and 2 molecules of reduced NADH.
Net Yield of Glycolysis: 2 Net ATP (4 produced minus 2 invested), 2 NADH, and 2 Pyruvate molecules per glucose.

## Section 3: The Citric Acid Cycle (Krebs Cycle)
Before entering the cycle, each 3-carbon pyruvate is transported into the mitochondrial matrix and converted into a 2-carbon Acetyl-CoA by the multienzyme Pyruvate Dehydrogenase Complex (PDC), releasing 1 CO2 and producing 1 NADH per pyruvate (2 NADH per glucose).

In the Krebs Cycle, Acetyl-CoA combines with the 4-carbon molecule Oxaloacetate to form 6-carbon Citrate (catalyzed by citrate synthase). Through a series of eight enzymatic steps, citrate is oxidized, releasing 2 CO2 molecules and regenerating oxaloacetate for another turn.
For each turn of the cycle (one Acetyl-CoA), the yield is:
- 3 NADH
- 1 FADH2
- 1 GTP (or ATP) via substrate-level phosphorylation
- 2 CO2 released as waste
Because each glucose produces two Acetyl-CoA molecules, the total Krebs cycle yield per glucose is 6 NADH, 2 FADH2, 2 ATP/GTP, and 4 CO2.

## Section 4: The Electron Transport Chain and Chemiosmosis
The high-energy electron carriers (10 NADH and 2 FADH2 generated across previous stages) deliver electrons to the Electron Transport Chain (ETC) embedded in the inner mitochondrial membrane. The ETC comprises four protein complexes (Complex I: NADH dehydrogenase, Complex II: Succinate dehydrogenase, Complex III: Cytochrome c reductase, and Complex IV: Cytochrome c oxidase).

As electrons cascade through redox centers of increasing electronegativity toward molecular oxygen (the terminal electron acceptor, which is reduced to water), Complexes I, III, and IV pump protons (H+) from the matrix into the intermembrane space. This creates a steep proton electrochemical gradient (the proton-motive force) characterized by both a pH gradient and an electrical potential across the membrane.

Chemiosmosis, formulated in Peter Mitchell's Nobel prize-winning chemiosmotic hypothesis, couples this proton-motive force to ATP synthesis. Protons flow down their electrochemical gradient back into the matrix exclusively through the Fo subunit of ATP Synthase. This proton flux drives the mechanical rotation of the c-ring rotor and central gamma-shaft, inducing conformational changes in the catalytic F1 beta-subunits that synthesize ATP from ADP and inorganic phosphate (Pi). Oxidative phosphorylation yields approximately 26-28 ATP, bringing total cellular yield to 30-32 ATP per glucose.
`;

export function getInitialDocuments(): DocumentItem[] {
  const osChunks = chunkDocument('doc-os-101', 'Operating Systems: Virtual Memory & Concurrency', OS_TEXT);
  const mlChunks = chunkDocument('doc-ml-201', 'Deep Learning: Transformers & Attention Mechanisms', ML_TEXT);
  const bioChunks = chunkDocument('doc-bio-301', 'Biochemistry: Cellular Respiration & ATP Synthesis', BIO_TEXT);

  return [
    {
      id: 'doc-os-101',
      title: 'Operating Systems: Virtual Memory & Concurrency',
      category: 'Computer Science',
      sourceType: 'notes',
      description: 'Comprehensive lecture notes covering address translation, TLBs, multi-level page tables, thrashing, synchronization, and deadlock prevention.',
      chunks: osChunks,
      uploadedAt: 'Preloaded Academic Material'
    },
    {
      id: 'doc-ml-201',
      title: 'Deep Learning: Transformers & Attention Mechanisms',
      category: 'Artificial Intelligence',
      sourceType: 'notes',
      description: 'In-depth notes on self-attention, scaled dot-product attention mathematics, positional embeddings, layer normalization, and AdamW optimization.',
      chunks: mlChunks,
      uploadedAt: 'Preloaded Academic Material'
    },
    {
      id: 'doc-bio-301',
      title: 'Biochemistry: Cellular Respiration & ATP Synthesis',
      category: 'Biological Sciences',
      sourceType: 'notes',
      description: 'Rigorous biochemical study guide on glycolysis, pyruvate oxidation, Krebs cycle stoichiometry, the electron transport chain, and Mitchell’s chemiosmosis.',
      chunks: bioChunks,
      uploadedAt: 'Preloaded Academic Material'
    }
  ];
}
