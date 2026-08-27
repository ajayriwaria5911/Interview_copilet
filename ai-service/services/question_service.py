# ai-service/services/question_service.py

import os
import json
import random
from typing import List
from models.question_models import (
    QuestionGenerationRequest,
    QuestionGenerationResponse,
    GeneratedQuestion,
    FeedbackGenerationRequest,
    FeedbackGenerationResponse,
)

# ── Question bank by topic ────────────────────────────────────────────
QUESTION_BANK = {
    "java spring boot": {
        "EASY": [
            {
                "question": "What is Spring Boot and how does it differ from Spring Framework?",
                "answer": "Spring Boot is an opinionated framework built on top of Spring Framework that eliminates boilerplate configuration. It provides auto-configuration, embedded servers (Tomcat), and starter dependencies. Spring Framework requires manual configuration while Spring Boot follows convention over configuration.",
                "hints": ["Think about auto-configuration", "Consider embedded servers"],
                "follow_up": "What are the main Spring Boot starters you have used?"
            },
            {
                "question": "What is @SpringBootApplication annotation?",
                "answer": "@SpringBootApplication is a combination of three annotations: @Configuration (marks class as config source), @EnableAutoConfiguration (enables auto-configuration), and @ComponentScan (scans for components in the package).",
                "hints": ["It combines 3 annotations", "Think about component scanning"],
                "follow_up": "Can you use these three annotations separately instead?"
            },
            {
                "question": "What is the difference between @Component, @Service, @Repository, and @Controller?",
                "answer": "All four are specializations of @Component. @Service marks business logic layer, @Repository marks data access layer and adds exception translation, @Controller marks presentation layer for Spring MVC, @Component is a generic stereotype.",
                "hints": ["They all enable component scanning", "Consider their semantic meaning"],
                "follow_up": "Does Spring treat them differently internally?"
            },
        ],
        "MEDIUM": [
            {
                "question": "Explain how Spring Boot auto-configuration works internally.",
                "answer": "Spring Boot reads META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports file which lists auto-configuration classes. Each class uses @ConditionalOn* annotations to check if specific classes/beans/properties exist before applying configuration. This happens during context refresh phase.",
                "hints": ["Think about @ConditionalOnClass", "Consider spring.factories file"],
                "follow_up": "How would you create a custom auto-configuration?"
            },
            {
                "question": "What is the difference between @RequestParam and @PathVariable?",
                "answer": "@PathVariable extracts values from URI path e.g. /users/{id}. @RequestParam extracts query parameters e.g. /users?page=1. @PathVariable is part of the URL structure while @RequestParam is optional query string data.",
                "hints": ["Consider URL structure", "Think about REST conventions"],
                "follow_up": "When would you use one over the other?"
            },
            {
                "question": "Explain Spring Boot's transaction management with @Transactional.",
                "answer": "@Transactional creates a proxy around the bean that manages transaction boundaries. Key properties: propagation (REQUIRED, REQUIRES_NEW etc), isolation level, readOnly for optimization, rollbackFor to specify exceptions that trigger rollback. Default rollback is for RuntimeException only.",
                "hints": ["Think about AOP proxy", "Consider propagation levels"],
                "follow_up": "What happens if @Transactional is called from the same class?"
            },
            {
                "question": "How does Spring Security JWT authentication work?",
                "answer": "Client sends credentials to /auth/login. Server validates and returns JWT token. Client stores token and sends it in Authorization: Bearer header. JwtAuthenticationFilter intercepts each request, validates the token signature and expiry, extracts user details, sets SecurityContext. Protected endpoints require valid token.",
                "hints": ["Think about filter chain", "Consider SecurityContext"],
                "follow_up": "How do you handle token refresh?"
            },
        ],
        "HARD": [
            {
                "question": "Explain Spring's circular dependency problem and how to resolve it.",
                "answer": "Circular dependency occurs when Bean A depends on Bean B and Bean B depends on Bean A. Solutions: 1) @Lazy injection delays bean creation, 2) @PostConstruct with setter injection, 3) ApplicationContext.getBean() for runtime lookup, 4) Refactoring to remove circular dependency, 5) Using @DependsOn for ordering.",
                "hints": ["Think about bean lifecycle", "Consider @Lazy annotation"],
                "follow_up": "How does Spring detect circular dependencies?"
            },
            {
                "question": "What is the difference between EAGER and LAZY loading in JPA and when does LazyInitializationException occur?",
                "answer": "EAGER loading fetches related entities immediately with parent. LAZY loading fetches on access. LazyInitializationException occurs when accessing a lazy collection outside an active Hibernate session (after transaction ends). Solutions: Open Session in View pattern (anti-pattern), join fetch in JPQL, @EntityGraph, DTO projection, or fetch within transaction.",
                "hints": ["Consider session lifecycle", "Think about N+1 problem"],
                "follow_up": "How would you solve the N+1 query problem?"
            },
        ]
    },
    "react frontend": {
        "EASY": [
            {
                "question": "What is the Virtual DOM and how does React use it?",
                "answer": "Virtual DOM is a lightweight JavaScript representation of the actual DOM. React maintains a virtual DOM tree. When state changes, React creates a new virtual DOM tree, compares it with the previous one (diffing algorithm), and only updates the actual DOM with the differences (reconciliation). This is more efficient than directly manipulating the real DOM.",
                "hints": ["Think about diffing algorithm", "Consider reconciliation"],
                "follow_up": "What is React Fiber and how does it improve the reconciliation?"
            },
            {
                "question": "What is the difference between useState and useRef?",
                "answer": "useState causes re-render when value changes and the new value is available in the next render. useRef doesn't cause re-render when changed and the value is immediately available via .current property. useRef is used for DOM references, storing mutable values that shouldn't trigger re-renders like timers, previous values.",
                "hints": ["Think about re-rendering", "Consider DOM access"],
                "follow_up": "When would you use useRef over useState?"
            },
        ],
        "MEDIUM": [
            {
                "question": "Explain the useEffect dependency array and common mistakes.",
                "answer": "The dependency array tells React when to re-run the effect. Empty array [] runs once on mount. No array runs on every render. With dependencies runs when any dependency changes. Common mistakes: missing dependencies causing stale closures, infinite loops from object/array dependencies (create new reference each render), not cleaning up subscriptions/timers causing memory leaks.",
                "hints": ["Think about stale closures", "Consider cleanup function"],
                "follow_up": "How do you handle an async function in useEffect?"
            },
            {
                "question": "What is the difference between useMemo and useCallback?",
                "answer": "useMemo memoizes a computed value — returns cached result if dependencies haven't changed. useCallback memoizes a function reference — returns same function instance if dependencies unchanged. useMemo(() => computeExpensiveValue(a, b), [a, b]). useCallback(() => doSomething(a), [a]). Both optimize performance by preventing unnecessary recalculations/re-renders.",
                "hints": ["Think about referential equality", "Consider when child components re-render"],
                "follow_up": "When should you NOT use useMemo or useCallback?"
            },
        ],
        "HARD": [
            {
                "question": "Explain React's reconciliation algorithm and how keys work.",
                "answer": "React compares element trees top-down. If element type changes, old tree is destroyed and new one created. If same type, React updates changed props. For lists, React uses keys to match elements between renders. Without keys React uses index causing issues when list items reorder. Keys should be stable, unique identifiers — not array indices for dynamic lists.",
                "hints": ["Think about element types", "Consider list reordering"],
                "follow_up": "Why is using array index as key problematic?"
            },
        ]
    },
    "data structures": {
        "EASY": [
            {
                "question": "What is the time complexity of common operations in a HashMap?",
                "answer": "Average case: O(1) for get, put, remove, containsKey. Worst case: O(n) when all keys hash to same bucket (hash collision). Java's HashMap uses chaining for collision resolution and converts chains to balanced BST (Red-Black tree) when chain length > 8, giving O(log n) worst case for Java 8+.",
                "hints": ["Think about hash collisions", "Consider Java 8 improvements"],
                "follow_up": "What is the difference between HashMap, LinkedHashMap, and TreeMap?"
            },
        ],
        "MEDIUM": [
            {
                "question": "Explain the difference between BFS and DFS and their use cases.",
                "answer": "BFS uses Queue, explores level by level, finds shortest path in unweighted graphs, O(V+E) time and O(V) space. DFS uses Stack (or recursion), explores depth first, used for cycle detection, topological sort, connected components, O(V+E) time and O(V) space. BFS is better for shortest path, DFS for exhaustive search.",
                "hints": ["Think about queue vs stack", "Consider memory usage"],
                "follow_up": "How would you detect a cycle in a directed graph?"
            },
            {
                "question": "What is dynamic programming and explain with an example?",
                "answer": "Dynamic programming solves complex problems by breaking into overlapping subproblems and storing results (memoization/tabulation). Example: Fibonacci — naive recursion is O(2^n), DP stores computed values making it O(n). Key properties: optimal substructure (optimal solution contains optimal solutions to subproblems) and overlapping subproblems.",
                "hints": ["Think about memoization", "Consider overlapping subproblems"],
                "follow_up": "What is the difference between top-down and bottom-up DP?"
            },
        ],
        "HARD": [
            {
                "question": "Design a LRU Cache with O(1) time complexity for get and put.",
                "answer": "Use HashMap + Doubly Linked List. HashMap stores key → node reference for O(1) access. Doubly Linked List maintains access order. On get: move node to front. On put: if key exists update and move to front, else insert at front and remove tail if over capacity. Head = most recent, Tail = least recent. Java's LinkedHashMap implements this natively.",
                "hints": ["Think about HashMap + LinkedList combination", "Consider head and tail pointers"],
                "follow_up": "How would you implement an LFU cache instead?"
            },
        ]
    },
    "system design": {
        "MEDIUM": [
            {
                "question": "How would you design a URL shortener like bit.ly?",
                "answer": "Components: API server, URL mapping DB (key-value store like Redis/Cassandra), ID generator. Flow: Generate unique 6-7 char ID (Base62 encoding of auto-increment ID or MD5 hash), store originalURL→shortCode mapping, redirect on GET request. Considerations: 302 vs 301 redirect, custom aliases, analytics, expiration, rate limiting, CDN for high read throughput.",
                "hints": ["Think about ID generation", "Consider Base62 encoding"],
                "follow_up": "How would you handle 100M URLs and 10B requests/day?"
            },
            {
                "question": "Explain CAP theorem and its implications for distributed systems.",
                "answer": "CAP theorem states a distributed system can only guarantee 2 of 3: Consistency (all nodes see same data), Availability (every request gets a response), Partition tolerance (system works despite network failures). Since network partitions are inevitable, systems choose CP (consistent + partition tolerant — MongoDB, HBase) or AP (available + partition tolerant — Cassandra, DynamoDB). RDBMS are typically CA.",
                "hints": ["Think about network partitions", "Consider real-world examples"],
                "follow_up": "What is eventual consistency and when would you accept it?"
            },
        ]
    },
    "node.js backend": {
        "MEDIUM": [
            {
                "question": "Explain the Node.js event loop and how it handles async operations.",
                "answer": "Node.js is single-threaded but handles async via event loop. Phases: timers (setTimeout/setInterval), pending callbacks, idle/prepare, poll (I/O callbacks), check (setImmediate), close callbacks. When async operation completes (I/O, timer), its callback is queued. Event loop picks callbacks when call stack is empty. microtasks (Promise callbacks, process.nextTick) run between phases.",
                "hints": ["Think about call stack vs callback queue", "Consider microtasks vs macrotasks"],
                "follow_up": "What is the difference between process.nextTick and setImmediate?"
            },
        ]
    },
    "machine learning": {
        "MEDIUM": [
            {
                "question": "Explain the bias-variance tradeoff in machine learning.",
                "answer": "Bias is error from wrong assumptions in the model (underfitting — high training AND test error). Variance is sensitivity to small training data fluctuations (overfitting — low training error but high test error). Goal is low bias AND low variance. Techniques: regularization (L1/L2) reduces variance, more training data reduces variance, simpler models reduce variance but increase bias, ensemble methods (Random Forest, Boosting) balance both.",
                "hints": ["Think about underfitting vs overfitting", "Consider regularization"],
                "follow_up": "How does cross-validation help identify the bias-variance tradeoff?"
            },
        ]
    },
    "devops": {
        "MEDIUM": [
            {
                "question": "Explain the difference between Docker containers and virtual machines.",
                "answer": "VMs virtualize hardware — each VM has full OS, hypervisor manages hardware access, heavy (GBs), slow startup (minutes). Containers virtualize OS — share host kernel, lightweight (MBs), fast startup (seconds), isolated via namespaces and cgroups. Docker containers are portable, consistent across environments. VMs provide stronger isolation. Containers are better for microservices, VMs for full OS isolation.",
                "hints": ["Think about OS kernel sharing", "Consider startup time and size"],
                "follow_up": "What is the difference between Docker and Kubernetes?"
            },
        ]
    },
    "behavioral": {
        "ALL": [
            {
                "question": "Tell me about yourself and your professional background.",
                "answer": "Use the present-past-future structure. Present: current role and key responsibilities. Past: relevant experience and achievements. Future: why this role excites you. Keep it professional, 2-3 minutes, focus on relevant experience.",
                "hints": ["Use present-past-future structure", "Keep it under 3 minutes"],
                "follow_up": "What is your greatest professional achievement?"
            },
            {
                "question": "Describe a challenging technical problem you solved.",
                "answer": "Use STAR method: Situation (context), Task (your responsibility), Action (specific steps you took), Result (measurable outcome). Highlight technical complexity, your thought process, collaboration, and impact. Quantify the result — performance improved by X%, reduced time by Y%.",
                "hints": ["Use STAR method", "Quantify the impact"],
                "follow_up": "What would you do differently if faced with the same problem today?"
            },
            {
                "question": "How do you handle disagreements with team members?",
                "answer": "Acknowledge different perspectives, focus on facts and data not emotions, have private conversation first, listen actively to understand their reasoning, find common ground, escalate respectfully if needed. Emphasize collaboration and finding the best solution for the team/product.",
                "hints": ["Focus on facts not emotions", "Show collaboration skills"],
                "follow_up": "Tell me about a specific time you had a disagreement."
            },
            {
                "question": "Describe a time you had to learn something quickly.",
                "answer": "Use STAR method. Highlight: identifying the learning goal, breaking it into manageable pieces, using multiple resources, hands-on practice, seeking help when stuck. Show adaptability, self-learning ability, and how you applied the new knowledge successfully.",
                "hints": ["Show structured approach to learning", "Emphasize practical application"],
                "follow_up": "How do you stay updated with new technologies?"
            },
            {
                "question": "Tell me about a time you failed and what you learned.",
                "answer": "Be honest about a real failure. Structure: what happened, your role in it, immediate response, what you learned, how you changed your approach. Show ownership (don't blame others), growth mindset, and specific changes you made. Avoid trivial failures or failures that show major character flaws.",
                "hints": ["Show ownership and accountability", "Emphasize the learning"],
                "follow_up": "How did that experience change how you work today?"
            },
        ]
    }
}

CODING_QUESTIONS = {
    "EASY": [
        {
            "question": "Write a function to check if a string is a palindrome.",
            "answer": "def is_palindrome(s):\n    s = s.lower().replace(' ', '')\n    return s == s[::-1]\n\n# Or using two pointers:\ndef is_palindrome(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        if s[left] != s[right]: return False\n        left += 1; right -= 1\n    return True\n\nTime: O(n), Space: O(1) for two pointers",
            "hints": ["Consider two pointer approach", "Handle case sensitivity"],
            "follow_up": "How would you handle special characters?"
        },
        {
            "question": "Find the second largest element in an array.",
            "answer": "def second_largest(arr):\n    first = second = float('-inf')\n    for num in arr:\n        if num > first:\n            second = first\n            first = num\n        elif num > second and num != first:\n            second = num\n    return second if second != float('-inf') else None\n\nTime: O(n), Space: O(1)",
            "hints": ["Single pass solution exists", "Handle duplicates"],
            "follow_up": "What if the array has all duplicate elements?"
        },
    ],
    "MEDIUM": [
        {
            "question": "Given an array of integers, find two numbers that add up to a target sum.",
            "answer": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nTime: O(n), Space: O(n)\nBrute force would be O(n²) with nested loops",
            "hints": ["Use a hash map for O(n) solution", "Think about complement = target - current"],
            "follow_up": "What if you need to return all pairs, not just one?"
        },
        {
            "question": "Implement a function to find the longest substring without repeating characters.",
            "answer": "def length_of_longest_substring(s):\n    char_index = {}\n    max_len = left = 0\n    for right, char in enumerate(s):\n        if char in char_index and char_index[char] >= left:\n            left = char_index[char] + 1\n        char_index[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nSliding window approach: Time O(n), Space O(min(n,m)) where m is charset size",
            "hints": ["Use sliding window technique", "HashMap stores last seen index"],
            "follow_up": "What is the time complexity and can you optimize space?"
        },
        {
            "question": "Write a function to validate if parentheses in a string are balanced.",
            "answer": "def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nTime: O(n), Space: O(n)",
            "hints": ["Use a stack data structure", "Create a mapping of closing to opening brackets"],
            "follow_up": "How would you return the positions of mismatched brackets?"
        },
    ],
    "HARD": [
        {
            "question": "Implement merge sort and analyze its time and space complexity.",
            "answer": "def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n\nTime: O(n log n) always. Space: O(n) for auxiliary arrays",
            "hints": ["Divide and conquer approach", "Merge step is key"],
            "follow_up": "How does merge sort compare to quicksort?"
        },
        {
            "question": "Find the median of two sorted arrays in O(log(m+n)) time.",
            "answer": "def find_median_sorted_arrays(nums1, nums2):\n    if len(nums1) > len(nums2):\n        nums1, nums2 = nums2, nums1\n    m, n = len(nums1), len(nums2)\n    lo, hi = 0, m\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = (m + n + 1) // 2 - i\n        if i < m and nums2[j-1] > nums1[i]: lo = i + 1\n        elif i > 0 and nums1[i-1] > nums2[j]: hi = i - 1\n        else:\n            if i == 0: max_left = nums2[j-1]\n            elif j == 0: max_left = nums1[i-1]\n            else: max_left = max(nums1[i-1], nums2[j-1])\n            if (m + n) % 2 == 1: return max_left\n            if i == m: min_right = nums2[j]\n            elif j == n: min_right = nums1[i]\n            else: min_right = min(nums1[i], nums2[j])\n            return (max_left + min_right) / 2\n\nBinary search on smaller array. Time: O(log(min(m,n)))",
            "hints": ["Binary search on the smaller array", "Think about partition"],
            "follow_up": "Explain the intuition behind this approach."
        },
    ]
}


class QuestionService:

    def generate_questions(
        self, request: QuestionGenerationRequest
    ) -> QuestionGenerationResponse:

        questions = []
        topic_key = request.topic.lower().strip()
        interview_type = request.interview_type.upper()
        difficulty = request.difficulty.upper() if request.difficulty else "MEDIUM"

        if interview_type == "BEHAVIORAL":
            raw_questions = QUESTION_BANK.get("behavioral", {}).get("ALL", [])
            random.shuffle(raw_questions)
            selected = raw_questions[:request.num_questions]

            for i, q in enumerate(selected):
                questions.append(GeneratedQuestion(
                    question_text=q["question"],
                    expected_answer=q["answer"],
                    difficulty="MEDIUM",
                    type="BEHAVIORAL",
                    topic=request.topic,
                    hints=q.get("hints", []),
                    follow_up=q.get("follow_up"),
                ))

        elif interview_type == "CODING":
            raw = CODING_QUESTIONS.get(difficulty, [])
            if len(raw) < request.num_questions:
                for d in ["EASY", "MEDIUM", "HARD"]:
                    raw = raw + CODING_QUESTIONS.get(d, [])
            raw = [q for q in raw if q["question"] not in
                   (request.previous_questions or [])]
            random.shuffle(raw)
            selected = raw[:request.num_questions]

            for q in selected:
                questions.append(GeneratedQuestion(
                    question_text=q["question"],
                    expected_answer=q["answer"],
                    difficulty=difficulty,
                    type="CODING",
                    topic=request.topic,
                    hints=q.get("hints", []),
                    follow_up=q.get("follow_up"),
                ))

        else:
            # TECHNICAL — match topic
            matched_key = None
            for key in QUESTION_BANK.keys():
                if key == "behavioral":
                    continue
                if key in topic_key or topic_key in key:
                    matched_key = key
                    break

            if matched_key:
                topic_bank = QUESTION_BANK[matched_key]
                all_questions = []
                for diff, qs in topic_bank.items():
                    for q in qs:
                        all_questions.append((diff, q))

                # Filter by experience level
                if request.experience_level == "Entry-Level":
                    filtered = [(d, q) for d, q in all_questions
                                if d == "EASY"]
                    if not filtered:
                        filtered = all_questions
                elif request.experience_level == "Senior":
                    filtered = [(d, q) for d, q in all_questions
                                if d in ["MEDIUM", "HARD"]]
                    if not filtered:
                        filtered = all_questions
                else:
                    filtered = [(d, q) for d, q in all_questions
                                if d in ["EASY", "MEDIUM"]]

                random.shuffle(filtered)
                selected = filtered[:request.num_questions]

                for diff, q in selected:
                    questions.append(GeneratedQuestion(
                        question_text=q["question"],
                        expected_answer=q["answer"],
                        difficulty=diff,
                        type="TECHNICAL",
                        topic=request.topic,
                        hints=q.get("hints", []),
                        follow_up=q.get("follow_up"),
                    ))

            # If not enough questions found — use defaults
            if len(questions) < request.num_questions:
                defaults = self._get_default_questions(
                    request.job_role,
                    request.topic,
                    request.num_questions - len(questions)
                )
                questions.extend(defaults)

        # Intro question is always first
        intro = GeneratedQuestion(
            question_text=f"Please introduce yourself. Tell me about your background, experience, and what motivated you to apply for the {request.job_role} position.",
            expected_answer="Use the present-past-future structure. Present: current role. Past: relevant experience. Future: why this role. Keep it 2-3 minutes.",
            difficulty="EASY",
            type=interview_type,
            topic="Introduction",
            hints=["Use present-past-future structure", "Keep it under 3 minutes"],
            follow_up="What is your greatest strength relevant to this role?"
        )

        # Insert intro at index 0
        questions = [intro] + [q for q in questions
                               if "introduce yourself" not in q.question_text.lower()]
        questions = questions[:request.num_questions]

        return QuestionGenerationResponse(
            job_role=request.job_role,
            topic=request.topic,
            interview_type=request.interview_type,
            experience_level=request.experience_level,
            questions=questions,
            total_generated=len(questions),
        )

    def generate_feedback(
        self, request: FeedbackGenerationRequest
    ) -> FeedbackGenerationResponse:

        answer = request.user_answer.strip()
        word_count = len(answer.split()) if answer else 0

        # Score calculation
        if not answer or answer.lower() in [
            "time's up", "time's up — no answer provided."
        ]:
            return FeedbackGenerationResponse(
                feedback="No answer was provided for this question. Try to manage your time better and provide at least a brief response.",
                strengths=[],
                weaknesses=["No answer provided", "Time management needs improvement"],
                improvements=["Practice answering within the time limit",
                              "Prepare structured answers in advance"],
                score=0.0,
                model_answer="Please review the question and prepare a structured answer."
            )

        if word_count < 10:
            score = 20.0
            feedback = "Your answer is too brief. Elaborate more with specific examples."
            strengths = ["Attempted to answer"]
            weaknesses = ["Answer too short", "Lacks specific examples"]
            improvements = ["Add more detail", "Use STAR method for behavioral questions",
                           "Provide concrete examples from your experience"]
        elif word_count < 30:
            score = 45.0
            feedback = f"Good start for a {request.job_role} position. Provide more technical depth and specific examples."
            strengths = ["Shows basic understanding"]
            weaknesses = ["Could be more detailed", "Missing specific examples"]
            improvements = ["Elaborate on technical details",
                           "Add real-world examples from your experience",
                           "Quantify your achievements"]
        elif word_count < 80:
            score = 65.0
            feedback = f"Solid answer! For a {request.job_role} role at {request.experience_level} level, consider adding edge cases and trade-offs."
            strengths = ["Good coverage of the topic", "Reasonable length"]
            weaknesses = ["Could mention edge cases",
                         "Trade-offs not discussed"]
            improvements = ["Discuss alternative approaches",
                           "Mention edge cases and error handling",
                           "Quantify impact where possible"]
        else:
            score = 82.0
            feedback = f"Excellent answer for a {request.job_role} position! You demonstrated strong understanding. Consider also mentioning performance implications."
            strengths = ["Comprehensive answer", "Good technical depth",
                        "Well structured response"]
            weaknesses = ["Could mention performance considerations"]
            improvements = ["Always consider scalability",
                           "Mention monitoring and observability"]

        # Type-specific adjustments
        if request.interview_type == "CODING":
            feedback += " Remember to always discuss time and space complexity."
            improvements.append("Always state Big O complexity")
            improvements.append("Consider edge cases like empty input, null values")
        elif request.interview_type == "BEHAVIORAL":
            if word_count >= 50:
                feedback += " Good use of the STAR method approach."
                strengths.append("Structured storytelling")
            improvements.append("Quantify the impact with specific numbers")

        return FeedbackGenerationResponse(
            feedback=feedback,
            strengths=strengths,
            weaknesses=weaknesses,
            improvements=improvements,
            score=round(score, 1),
            model_answer=f"A strong answer should cover: the core concept, a real-world example, trade-offs, and how you've applied it in your {request.job_role} experience."
        )

    def _get_default_questions(
        self,
        job_role: str,
        topic: str,
        count: int
    ) -> List[GeneratedQuestion]:
        defaults = [
            GeneratedQuestion(
                question_text=f"What are the key technical skills required for a {job_role}?",
                expected_answer=f"For a {job_role} position, key skills include relevant programming languages, frameworks, database knowledge, system design, and soft skills like communication and teamwork.",
                difficulty="MEDIUM",
                type="TECHNICAL",
                topic=topic,
                hints=["Think about technical and soft skills", "Consider the job requirements"],
            ),
            GeneratedQuestion(
                question_text=f"How do you stay updated with the latest trends in {topic}?",
                expected_answer="Following official documentation, tech blogs, GitHub repositories, attending conferences, contributing to open source, online courses, and community participation.",
                difficulty="EASY",
                type="TECHNICAL",
                topic=topic,
                hints=["Mention specific resources", "Show genuine interest in learning"],
            ),
            GeneratedQuestion(
                question_text=f"Describe a project where you used {topic} in a production environment.",
                expected_answer="Describe the project scope, your role, technical challenges faced, solutions implemented, and measurable outcomes. Highlight team collaboration and impact.",
                difficulty="MEDIUM",
                type="TECHNICAL",
                topic=topic,
                hints=["Use STAR method", "Quantify the impact"],
            ),
            GeneratedQuestion(
                question_text=f"What are common pitfalls when working with {topic} and how do you avoid them?",
                expected_answer="Common pitfalls depend on the technology but generally include performance issues, security vulnerabilities, poor error handling, and inadequate testing. Describe specific examples from your experience.",
                difficulty="HARD",
                type="TECHNICAL",
                topic=topic,
                hints=["Think about real challenges you've faced", "Show problem-solving ability"],
            ),
            GeneratedQuestion(
                question_text=f"How would you mentor a junior developer learning {topic}?",
                expected_answer="Start with fundamentals, provide hands-on practice, code reviews, pair programming, recommend resources, set incremental challenges, give constructive feedback, and encourage asking questions.",
                difficulty="MEDIUM",
                type="TECHNICAL",
                topic=topic,
                hints=["Show leadership skills", "Consider different learning styles"],
            ),
        ]
        return defaults[:count]