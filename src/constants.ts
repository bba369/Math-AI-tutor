import { Level, Topic } from './types';

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'd1',
    task: "आधारभूत: $12 + 15$ कति हुन्छ?",
    options: ["२५", "२७", "३०", "१७"],
    correctIndex: 1,
    difficulty: 1
  },
  {
    id: 'd2',
    task: "मध्यम: $2x + 5 = 15$ भए $x$ को मान कति हुन्छ?",
    options: ["५", "१०", "२", "२०"],
    correctIndex: 0,
    difficulty: 2
  },
  {
    id: 'd3',
    task: "ज्यामिति: त्रिभुजका तीनवटै कोणको जोड कति हुन्छ?",
    options: ["$90^\\circ$", "$180^\\circ$", "$360^\\circ$", "$270^\\circ$"],
    correctIndex: 1,
    difficulty: 3
  },
  {
    id: 'd4',
    task: "क्षेत्रमिति: लम्बाइ ५ सेमी र चौडाइ ३ सेमी भएको आयतको क्षेत्रफल कति हुन्छ?",
    options: ["८ सेमी", "१५ सेमी", "१६ सेमी", "२ सेमी"],
    correctIndex: 1,
    difficulty: 4
  },
  {
    id: 'd5',
    task: "जटिल: $2^3 \\times 2^2$ को मान कति हुन्छ?",
    options: ["$2^1$", "$2^5$", "$2^6$", "$2^{32}$"],
    correctIndex: 1,
    difficulty: 5
  }
];

export const VIDEO_REFERENCES: Record<string, { title: string, url: string }[]> = {
  "sets-1": [
    { title: "Venn Diagrams Basics", url: "https://www.youtube.com/embed/f_tZzZ_qf7M" }
  ],
  "sets-2": [
    { title: "Three Sets Venn Diagram", url: "https://www.youtube.com/embed/Pj1iXlU_dC0" }
  ],
  "sets-3": [
    { title: "Sets Word Problems", url: "https://www.youtube.com/embed/2_HjR2EwGDA" }
  ],
  "arithmetic-1": [
    { title: "Compound Interest", url: "https://www.youtube.com/embed/mKk38v_uB10" }
  ],
  "arithmetic-2": [
    { title: "Population Growth", url: "https://www.youtube.com/embed/YIqofD0r2d0" }
  ],
  "arithmetic-3": [
    { title: "Depreciation", url: "https://www.youtube.com/embed/wE10g6T0e_E" }
  ],
  "mensuration-1": [
    { title: "Cylinder & Sphere", url: "https://www.youtube.com/embed/c0T7tI6dM8w" }
  ],
  "mensuration-2": [
    { title: "Prism and Pyramid", url: "https://www.youtube.com/embed/sZ7U0_Xv_uI" }
  ],
  "mensuration-3": [
    { title: "Combined Solids", url: "https://www.youtube.com/embed/v9N39bA9A_M" }
  ],
  "algebra-1": [
    { title: "HCF and LCM", url: "https://www.youtube.com/embed/LwCRRUa8yTU" }
  ],
  "algebra-2": [
    { title: "Indices Mastery", url: "https://www.youtube.com/embed/NybHckSEQBI" }
  ],
  "algebra-3": [
    { title: "Rational Expressions", url: "https://www.youtube.com/embed/vDqNe1H015M" }
  ],
  "geometry-1": [
    { title: "Area of Triangles", url: "https://www.youtube.com/embed/302eJ3TzJcg" }
  ],
  "geometry-2": [
    { title: "Quadrilaterals", url: "https://www.youtube.com/embed/v3H8d5_993E" }
  ],
  "geometry-3": [
    { title: "Circle Geometry", url: "https://www.youtube.com/embed/fW_0N_S7S5E" }
  ],
  "trigonometry-1": [
    { title: "Height and Distance", url: "https://www.youtube.com/embed/PUB0TaZ7bhA" }
  ],
  "statistics-1": [
    { title: "Median and Mode", url: "https://www.youtube.com/embed/xxpc-HPZH5M" }
  ],
  "probability-1": [
    { title: "Probability Basics", url: "https://www.youtube.com/embed/KzfWUEJjG18" }
  ],
  "probability-2": [
    { title: "Tree Diagrams", url: "https://www.youtube.com/embed/8-WvF8X_1_Y" }
  ],
  "coordinates-1": [
    { title: "Distance and Slope", url: "https://www.youtube.com/embed/s7i4Wn-E85I" }
  ],
  "vectors-1": [
    { title: "Vector Operations", url: "https://www.youtube.com/embed/fNk_zzaMoSs" }
  ]
};

export const SKILL_TREE: Topic[] = [
  {
    id: "sets",
    name: "समूह (Sets)",
    icon: "Layers",
    phase: 1,
    levels: [
      {
        id: 50,
        levelNum: 1,
        title: "Level 1: Venn Diagrams (2-Sets)",
        bites: [
          {
            id: 1,
            concept: "दुईवटा समूहको सम्बन्ध देखाउन भेन चित्र (Venn Diagram) प्रयोग गरिन्छ। $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$।",
            task: "यदि $n(A)=20$, $n(B)=15$ र $n(A \\cap B)=5$ भए $n(A \\cup B)$ कति हुन्छ?",
            hint: "२० र १५ जोडेर ५ घटाउनुहोस्।",
            options: ["३०", "३५", "४०", "२५"],
            correctIndex: 0
          }
        ]
      },
      {
        id: 51,
        levelNum: 2,
        title: "Level 2: 3-Sets Concepts",
        bites: [
          {
            id: 1,
            concept: "तीनवटा समूहहरु A, B, र C हुँदा तीनवटैको साझा भागलाई $n(A \\cap B \\cap C)$ भनिन्छ।",
            task: "यदि $n(U)=100$, र सबै ३ खेल खेल्ने १० जना छन् भने, कम्तिमा एउटा पनि खेल नखेल्ने कसरि निकालिन्छ?",
            hint: "पूरक (Complement) को सुत्र प्रयोग गर्नुहोस्।",
            options: ["$n(A \\cup B \\cup C)$", "$n(U) - n(A \\cup B \\cup C)$", "$n(A) + n(B) + n(C)$", "$n(A \\cap B \\cap C)$"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 52,
        levelNum: 3,
        title: "Level 3: Sets Word Problems",
        bites: [
          {
            id: 1,
            concept: "समूहका शाब्दिक समस्याहरु (Word Problems) मा $n_{0}(A)$ भन्नाले समूह A मात्र भन्ने बुझिन्छ।",
            task: "५० जना मध्ये २० जनालाई चिया मात्र र १५ जनालाई कफी मात्र मनपर्छ भने दुवै मन नपर्ने कति होलान् यदि ५ जनालाई दुवै मनपर्छ भने?",
            hint: "२० + १५ + ५ = ४०, अनि ५० बाट घटाउनुहोस्।",
            options: ["१५", "१०", "५", "२०"],
            correctIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: "arithmetic",
    name: "अङ्कगणित (Arithmetic)",
    icon: "Calculator",
    phase: 1,
    levels: [
      {
        id: 101,
        levelNum: 1,
        title: "Level 1: Compound Interest",
        bites: [
          {
            id: 1,
            concept: "चक्रीय ब्याज (Compound Interest) मा ब्याजको पनि ब्याज लाग्छ। $CA = P(1 + R/100)^T$।",
            task: "रु १००० को १०% का दरले १ वर्षको वार्षिक चक्रीय ब्याज कति हुन्छ?",
            hint: "पहिलो वर्षको लागि साधारण ब्याज र चक्रीय ब्याज बराबर हुन्छ।",
            options: ["रु १००", "रु ११०", "रु २०", "रु १०"],
            correctIndex: 0
          }
        ]
      },
      {
        id: 102,
        levelNum: 2,
        title: "Level 2: Population Growth",
        bites: [
          {
            id: 1,
            concept: "जनसंख्या वृद्धि (Population Growth) को सुत्र चक्रीय ब्याज जस्तै हुन्छ। $P_t = P_0(1 + R/100)^T$।",
            task: "कुनै गाउँको सुरुको जनसंख्या १०००० थियो र वार्षिक १०% ले बढ्छ भने १ वर्षपछी कति हुन्छ?",
            hint: "१०००० को १०% भनेको १००० हुन्छ।",
            options: ["११०००", "१२०००", "९०००", "१०१००"],
            correctIndex: 0
          }
        ]
      },
      {
        id: 103,
        levelNum: 3,
        title: "Level 3: Depreciation",
        bites: [
          {
            id: 1,
            concept: "मुल्यह्रास (Depreciation) मा वस्तुको मुल्य समयसंगै घट्दै जान्छ। यहाँ सुत्रमा - (माइनस) प्रयोग हुन्छ: $V_t = V_0(1 - R/100)^T$।",
            task: "एउटा यन्त्रको मुल्य रु ५००० छ। यसको मुल्य १०% ले घट्छ भने १ वर्षपछि कति हुन्छ?",
            hint: "५००० को १०% भनेको ५०० हो, ५००० बाट घटाउनुहोस्।",
            options: ["५५००", "५०००", "४५००", "४०००"],
            correctIndex: 2
          }
        ]
      }
    ]
  },
  {
    id: "mensuration",
    name: "क्षेत्रमिति (Mensuration)",
    icon: "Box",
    phase: 2,
    levels: [
      {
        id: 401,
        levelNum: 1,
        title: "Level 1: Cylinder & Sphere",
        bites: [
          {
            id: 1,
            concept: "बेलना (Cylinder) को पूरा सतहको क्षेत्रफल $2\\pi r(r + h)$ हुन्छ।",
            task: "बेलनाको आधार (Base) कुन आकारको हुन्छ?",
            hint: "बेलनाको माथि वा तलको भाग सम्झनुहोस्।",
            options: ["वर्ग", "त्रिभुज", "वृत्त", "आयत"],
            correctIndex: 2
          }
        ]
      },
      {
        id: 402,
        levelNum: 2,
        title: "Level 2: Prism & Pyramid",
        bites: [
          {
            id: 1,
            concept: "त्रिभुजाकार प्रिज्म (Triangular Prism) को आयतन $V = A \\times h$ (आधारको क्षेत्रफल $\\times$ उचाइ) हुन्छ।",
            task: "पिरामिडको आयतन (Volume) को सुत्रमा कति भाग (Fraction) हुन्छ?",
            hint: "बेलना र कोणको सम्बन्ध जस्तै सम्झनुहोस्।",
            options: ["$1/2$", "$1/3$", "$1/4$", "$1/5$"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 403,
        levelNum: 3,
        title: "Level 3: Combined Solids",
        bites: [
          {
            id: 1,
            concept: "संयुक्त ठोस वस्तु (Combined Solid) मा बेलना र अर्धगोला जोडिएको हुन सक्छ। यसमा दुवैको सतह जोडिन्छ।",
            task: "बेलनाको माथि अर्धगोला राखिएको भाँडाको कुल आयतन कसरी निकालिन्छ?",
            hint: "दुवै वस्तुको आयतन जोड्नुहोस्।",
            options: ["$V_{cyl} + V_{hem}$", "$V_{cyl} - V_{hem}$", "$V_{cyl} \\times V_{hem}$", "$V_{cyl}$ मात्र"],
            correctIndex: 0
          }
        ]
      }
    ]
  },
  {
    id: "algebra",
    name: "बीजगणित (Algebra)",
    icon: "Variable",
    phase: 2,
    levels: [
      {
        id: 201,
        levelNum: 1,
        title: "Level 1: HCF & LCM",
        bites: [
          {
            id: 1,
            concept: "बीजगणितमा HCF (मस) भनेको साझा खण्ड (Common Factor) मात्र हो।",
            task: "$a^2-b^2$ र $(a-b)^2$ को HCF कति हुन्छ?",
            hint: "$a^2-b^2 = (a-b)(a+b)$ र $(a-b)^2 = (a-b)(a-b)$।",
            options: ["$a+b$", "$a-b$", "$(a-b)(a+b)$", "$a^2$"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 202,
        levelNum: 2,
        title: "Level 2: Indices",
        bites: [
          {
            id: 1,
            concept: "घाताङ्क (Indices) को नियममा, यदि आधार (Base) एउटै भए गुणन गर्दा घाताङ्क जोडिन्छ, $a^x \\times a^y = a^{x+y}$।",
            task: "$x^3 \\times x^4$ को मान कति हुन्छ?",
            hint: "३ र ४ जोड्नुहोस्।",
            options: ["$x^{12}$", "$x^7$", "$x^1$", "$2x^7$"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 203,
        levelNum: 3,
        title: "Level 3: Rational Expressions",
        bites: [
          {
            id: 1,
            concept: "बीजगणितीय अभिव्यञ्जक (Rational Expressions) हल गर्दा पहिला खण्डीकरण गरेर काट्नुपर्छ।",
            task: "$\\frac{x^2-1}{x-1}$ लाई सरल गर्दा कति हुन्छ?",
            hint: "$x^2-1 = (x+1)(x-1)$ हो।",
            options: ["$x-1$", "$x+1$", "$1$", "$x$"],
            correctIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: "geometry",
    name: "ज्यामिति (Geometry)",
    icon: "Triangle",
    phase: 3,
    levels: [
      {
        id: 301,
        levelNum: 1,
        title: "Level 1: Triangle Theorems",
        bites: [
          {
            id: 1,
            concept: "एउटै आधार र उही समानान्तर रेखाहरू बीचका त्रिभुजहरूको क्षेत्रफल बराबर हुन्छ।",
            task: "यदि दुई त्रिभुज एउटै आधारमा छन्, तिनीहरूको क्षेत्रफल कहिले बराबर हुन्छ?",
            hint: "रेखाको सम्बन्ध समानान्तर हुनुपर्छ।",
            options: ["काटिएका रेखाहरू", "समानान्तर रेखाहरू", "ठाडो रेखाहरू", "कुनै पनि"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 302,
        levelNum: 2,
        title: "Level 2: Quadrilaterals",
        bites: [
          {
            id: 1,
            concept: "समानान्तर चतुर्भुजको क्षेत्रफल $=$ आधार $\\times$ उचाइ।",
            task: "एउटै आधार र उही समानान्तर रेखाहरू बीच रहेका समानान्तर चतुर्भुज र त्रिभुजको क्षेत्रफलको सम्बन्ध कस्तो हुन्छ?",
            hint: "त्रिभुज समानान्तर चतुर्भुजको आधा हुन्छ।",
            options: ["बराबर", "त्रिभुज आधा हुन्छ", "त्रिभुज दोब्बर हुन्छ", "कुनै सम्बन्ध छैन"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 303,
        levelNum: 3,
        title: "Level 3: Circle Geometry",
        bites: [
          {
            id: 1,
            concept: "वृत्तको एउटै चापमा आधारित परिधि कोणहरू (Inscribed Angles) बराबर हुन्छन्।",
            task: "एउटै चापमा आधारित केन्द्रीय कोण (Central Angle) र परिधि कोणको सम्बन्ध के हो?",
            hint: "केन्द्रीय कोण परिधि कोणको दोब्बर हुन्छ।",
            options: ["दोब्बर", "आधा", "बराबर", "चार गुणा"],
            correctIndex: 0
          }
        ]
      }
    ]
  },
  {
    id: "trigonometry",
    name: "त्रिकोणमिति (Trigonometry)",
    icon: "Spline",
    phase: 3,
    levels: [
      {
        id: 501,
        levelNum: 1,
        title: "Level 1: Height & Distance",
        bites: [
          {
            id: 1,
            concept: "समकोणी त्रिभुजमा $\\tan \\theta = P/B$ प्रयोग गरेर उचाइ र दूरी निकालिन्छ।",
            task: "यदि कोण $45^\\circ$ छ र आधार (Base) १० मिटर छ भने उचाइ (P) कति होला?",
            hint: "$\\tan 45^\\circ = 1$ हुन्छ।",
            options: ["५ मिटर", "१० मिटर", "२० मिटर", "$10\\sqrt{3}$"],
            correctIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: "statistics",
    name: "तथ्याङ्कशास्त्र (Statistics)",
    icon: "BarChart3",
    phase: 4,
    levels: [
      {
        id: 601,
        levelNum: 1,
        title: "Level 1: Median & Mode",
        bites: [
          {
            id: 1,
            concept: "मध्यिका (Median) ले तथ्याङ्कको बीचको मान जनाउँछ। $Md = L + (N/2 - cf)/f \\times i$।",
            task: "श्रेणीकृत तथ्याङ्कमा बीचको मान निकाल्ने विधिलाई के भनिन्छ?",
            hint: "यो मापन केन्द्रिय प्रवृतिको दोस्रो भाग हो।",
            options: ["मध्यक", "मध्यिका", "रीत", "विचलन"],
            correctIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: "probability",
    name: "सम्भाव्यता (Probability)",
    icon: "Dice5",
    phase: 4,
    levels: [
      {
        id: 701,
        levelNum: 1,
        title: "Level 1: Basic Probability",
        bites: [
          {
            id: 1,
            concept: "कुनै घटना हुने सम्भावना (Probability) ० र १ को बीचमा हुन्छ।",
            task: "एउटा सिक्का उफ्रार्दा टाउको (Head) आउने सम्भावना कति हुन्छ?",
            hint: "सिक्काका दुईवटा पाटा हुन्छन्।",
            options: ["०", "१", "$1/2$", "$1/4$"],
            correctIndex: 2
          }
        ]
      },
      {
        id: 702,
        levelNum: 2,
        title: "Level 2: Tree Diagrams",
        bites: [
          {
            id: 1,
            concept: "रुख चित्र (Tree Diagram) ले विभिन्न सम्भावित परिणामहरू देखाउँछ।",
            task: "दुईवटा सिक्का उफ्राउँदा आउने परिणामहरू देखाउन कुन चित्र उपयुक्त हुन्छ?",
            hint: "हाँगाहरू भएको चित्र सम्झनुहोस्।",
            options: ["भेन चित्र", "रुख चित्र", "स्तम्भ चित्र", "वृत्त चित्र"],
            correctIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: "coordinates",
    name: "निर्देशाङ्क ज्यामिति (Coordinates)",
    icon: "Target",
    phase: 4,
    levels: [
      {
        id: 801,
        levelNum: 1,
        title: "Level 1: Distance & Slope",
        bites: [
          {
            id: 1,
            concept: "दुई बिन्दु बीचको दूरी सुत्र: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$।",
            task: "बिन्दुहरू $(०,०)$ र $(३,४)$ बीचको दूरी कति हुन्छ?",
            hint: "$\\sqrt{3^2 + 4^2}$ निकाल्नुहोस्।",
            options: ["५", "७", "२५", "१"],
            correctIndex: 0
          }
        ]
      }
    ]
  },
  {
    id: "vectors",
    name: "भेक्टर (Vectors)",
    icon: "ArrowUpRight",
    phase: 4,
    levels: [
      {
        id: 901,
        levelNum: 1,
        title: "Level 1: Vector Addition",
        bites: [
          {
            id: 1,
            concept: "भेक्टरमा मान र दिशा दुवै हुन्छ। $\\vec{a} + \\vec{b}$ ले परिणामी भेक्टर दिन्छ।",
            task: "यदि $\\vec{a} = (3, 2)$ र $\\vec{b} = (1, 4)$ भए $\\vec{a} + \\vec{b}$ कति हुन्छ?",
            hint: "संगत अङ्गहरू जोड्नुहोस्: $(3+1, 2+4)$।",
            options: ["$(2, 2)$", "$(4, 6)$", "$(4, 2)$", "$(3, 8)$"],
            correctIndex: 1
          }
        ]
      }
    ]
  }
];

export const SYLLABUS_STAGES = [
  "समूह (Sets)",
  "अङ्कगणित (Arithmetic)",
  "क्षेत्रमिति (Mensuration)",
  "बीजगणित (Algebra)",
  "ज्यामिति (Geometry)",
  "त्रिकोणमिति (Trigonometry)",
  "तथ्याङ्कशास्त्र (Statistics)",
  "सम्भाव्यता (Probability)",
  "निर्देशाङ्क ज्यामिति (Coordinates)",
  "भेक्टर (Vectors)"
];

export const LEVEL_ONE: Level = {
  id: 1,
  levelNum: 1,
  title: "समूहको आधारभूत ज्ञान (Basics of Sets)",
  bites: [
    {
      id: 1,
      concept: "सुस्पष्ट परिभाषित वस्तुहरूको समूहलाई 'Set' भनिन्छ। जस्तै: हप्ताका दिनहरूको समूह।",
      task: "तलका मध्ये कुन एउटा 'Set' हो?",
      hint: "एकपटक सोच्नुहोस् त... कुन समूहमा रहेका सदस्यहरू सबैको लागि एउटै हुन्छन्?",
      options: ["मनपर्ने फलफूलहरूको समूह", "राम्रा विद्यार्थीहरूको समूह", "जोर सङ्ख्याको समूह ($2, 4, 6, ...$)", "मिठा मिठाईहरूको समूह"],
      correctIndex: 2
    },
    {
      id: 2,
      concept: "समूह भित्रका वस्तुहरूलाई 'Elements' भनिन्छ। यिनीहरूलाई मझौला कोष्ठक $\\{ \\}$ भित्र राखिन्छ।",
      task: "स्वराक्षर (Vowels) को समूह $\\{a, e, i, o, u\\}$ मा कतिवटा 'Elements' छन्?",
      hint: "एकपटक सोच्नुहोस् त... कोष्ठक भित्र कतिवटा अक्षरहरू छन्?",
      options: ["३", "४", "५", "६"],
      correctIndex: 2
    },
    {
      id: 3,
      concept: "समूहमा भएका सदस्यहरूको सङ्ख्यालाई 'Cardinality' भनिन्छ। यसलाई $n(A)$ ले जनाइन्छ।",
      task: "यदि $A = \\{2, 3, 5, 7\\}$ भए, $n(A)$ को मान कति हुन्छ?",
      hint: "एकपटक सोच्नुहोस् त... समूह $A$ मा कतिवटा अङ्कहरू गन्नुहोस् त।",
      options: ["२", "३", "४", "५"],
      correctIndex: 2
    },
    {
      id: 4,
      concept: "यदि एउटा समूहका सबै सदस्य अर्को समूहमा पर्छन् भने, त्यसलाई 'Subset' भनिन्छ।",
      task: "यदि $A = \\{1, 2\\}$ र $B = \\{1, 2, 3\\}$ भए, के $A$ समूह $B$ को Subset हो?",
      hint: "एकपटक सोच्नुहोस् त... के $1$ र $2$ दुवै $B$ मा भेटिन्छन्?",
      options: ["हो", "होइन", "भन्न सकिन्न", "पर्दैन"],
      correctIndex: 0
    },
    {
      id: 5,
      concept: "दुई समूहमा साझा (Common) भएका सदस्यहरूलाई 'Intersection' ($A \\cap B$) भनिन्छ।",
      task: "यदि $A = \\{1, 2, 3\\}$ र $B = \\{3, 4, 5\\}$ भए, $A \\cap B$ पत्ता लगाउनुहोस्।",
      hint: "एकपटक सोच्नुहोस् त... दुवै समूहमा कुन अङ्क दोहोरिएको छ?",
      options: ["$\\{1, 2\\}$", "$\\{3\\}$", "$\\{4, 5\\}$", "$\\{1, 5\\}$"],
      correctIndex: 1
    },
    {
      id: 6,
      concept: "दुई समूहका सबै सदस्यहरूलाई मिसाउँदा 'Union' ($A \\cup B$) बन्छ। साझालाई एक पटक मात्र लेखिन्छ।",
      task: "यदि $X = \\{a, b\\}$ र $Y = \\{b, c\\}$ भए, $X \\cup Y$ कति हुन्छ?",
      hint: "एकपटक सोच्नुहोस् त... $a, b, c$ लाई एउटै ठाउँमा मिसाएर लेख्नुहोस् त।",
      options: ["$\\{a, b, c\\}$", "$\\{a, b, b, c\\}$", "$\\{a, c\\}$", "$\\{b\\}$"],
      correctIndex: 0
    }
  ]
};
