---
layout: default
title: Dynamic Memory Allocation
nav_order: 5
parent: CLang
has_children: true
---

# Dynamic Memory Allocation
{: .no_toc }
### Lets take a look at: *malloc*, *calloc*, *realloc*, and *free*
{: .no_toc }

---

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### Malloc :: Memory Allocation
**Main point**: In essence, allocates one large block of memory.
 - dynamically allocates a single large block of memory with a specified size
 - malloc -> void*
 - Returns a void pointer, castable into any type

##### Example Syntax
{: .no_toc }
```c
int* ptr = (int*) malloc(100 * sizeof(int));
```
Lets pull this apart:
 - `int* ptr`: defines an int pointer that malloc will return to
 - `(int*)`: type that malloc is being casted to (int ptr)
 - `100 * sizeof(int)`: byte size, *100 * 4 = 400B*

 This example, allocates *400 bytes*, and the int* holds the address of the first byte.
> Insufficient space returns a *NULL* ptr.

--- 

### Calloc :: Contiguous Allocation
**Main point**: In essence, allocates multiple blocks of memory next to each other (like an array!)
 - dynamically allocates a specific number of blocks of memory of specified type
 - initializes each block with '0'
 - calloc -> void*
 - Returns a void pointer, castable into any type

##### Example Syntax
{: .no_toc }
```c
float* ptr = (float*) calloc(15, sizeof(float));
```
Lets pull this apart:
 - `float* ptr`: defines an int pointer that calloc will return to
 - `(float*)`: type that calloc is being casted to (float ptr)
 - `15`: amount of blocks to create
 - `sizeof(float)`: block size, a float is *4B*
 This example, allocates 15 blocks of memory each being 4B in size.
> Insufficient space returns a *NULL* ptr.

---

### Realloc :: Re-Allocation
**Main point**: In essence, re-allocates what originally was allocated.
 - dynamically change memory allocation of previously allocated memory
 - re-initializes each block with '0'

##### Example Syntax
{: .no_toc }
```c
char* ptr = (char*) malloc(10 * sizeof(char));
ptr = (char*) realloc(ptr, 50 * sizeof(char));
```
Lets pull this apart:
 - `char* ptr = (char*) malloc(10 * sizeof(char));`: This allocates our block to change, char ptr *10B* in size
 - `(char*)`: type that realloc is being casted to (char ptr)
 - `ptr`: already allocated memory that we are changing
 - `50 * sizeof(char)`: new block size, *50 * 1 = 50B*
 This example, re-allocates a char ptr that originally held *10B* into *50B*
> Insufficient space returns a *NULL* ptr.

---

### Free
**Main point**: In essence, dynamically de-allocates memory.
 - Good practice is to use this when done with allocated memory to save resources

##### Example Syntax
{: .no_toc }
```c
int* ptr = (int*) malloc(4 * sizeof(int));
free(ptr);
```
Lets pull this apart:
 - `int* ptr = (int*) malloc(4 * sizeof(int));`: This allocates our block to free, int ptr *16B* in size
 - `ptr`: allocated memory to release
 This example, de-allocates the allocated memory of *ptr* the int*, giving up the memory address that *ptr* held and is set to *NULL*
 
---
 
### Conclusion
  Hopefully, here I was able to show how important dynamic allocation is to your project that you are working on in the beautiful language of C. Most other languages automatically do all memory operations themselves and make it easy for the programmer, but having this level of control on each bit can both be a wonderful blessing or devastating curse.

#### Simple Summary
<dl>
  <dt>Malloc</dt>
  <dd>Allocates one large block of memory of a specified bitsize</dd>
  <dt>Calloc</dt>
  <dd>Allocates contiguos memory blocks of a specified bitsize (similar to an array)</dd>
  <dt>Realloc</dt>
  <dd>Re-allocates a block/s of memory that have previously been allocated</dd>
  <dt>Free</dt>
  <dd>Releases allocated memory back to the stack/heap cleaning up resources</dd>
</dl>

---

###### Resources Used
{: .no_toc }
 - [C Reference](https://en.cppreference.com/w/c/memory)
 - [Geeks for Geeks](https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c-using-malloc-calloc-free-and-realloc/)
