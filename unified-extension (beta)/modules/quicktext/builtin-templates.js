// Vinavi Quick Text  Built-in Medical Templates
// Designed for Orthopedic OPD use on Vinavi portal
//
// How to trigger: type the shortcut in any text field and press Space or Enter
// Example: type  /ccneck  then press Space   popup opens immediately
//
// Output format: clean medical prose, no section headers
// noHeader: true   no "Section:" header line in output
// type: "prefix"   label is used as a sentence opener e.g. "Neck pain for 2 weeks"
// type: "select"   dropdown; outputs "Label: chosen value"
// type: "text"     free-text input; outputs "Label: typed value"

var VINAVI_BUILTIN_TEMPLATES = {

  // 
  //  HMH-OPD-CC  (Chief Complaints)
  // 

  "/ccneck": {
    title: "CC Neck Pain",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "normal",
    mainLabels: [
      {
        name: "CC Neck",
        noHeader: true,
        subLabels: [
          { label: "Neck pain for", type: "prefix", width: "half", default: "1 week" },
          { label: "VAS",           type: "text",   width: "half", default: "/10" }
        ]
      }
    ]
  },

  "/cclbp": {
    title: "CC Low Back Pain",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "CC LBP",
        noHeader: true,
        subLabels: [
          { label: "Low back pain for", type: "prefix", width: "half", default: "2 weeks" },
          { label: "VAS",               type: "text",   width: "half", default: "/10" },
          { label: "Onset",             type: "select", width: "half", options: ["acute", "gradual"],                                             default: "acute" },
          { label: "Radiation",         type: "select", width: "half", options: ["none", "buttock", "left leg", "right leg", "bilateral"],        default: "none" },
          { label: "Aggravating",       type: "select", width: "half", options: ["bending", "lifting", "prolonged sitting", "walking"],           default: "bending" },
          { label: "Night pain",        type: "select", width: "half", options: ["no", "yes"],                                                    default: "no" },
          { label: "Red flags",         type: "select", width: "half", options: ["none", "bladder dysfunction", "bowel dysfunction"],             default: "none" },
          { label: "Previous treatment",type: "select", width: "full", options: ["none", "analgesics", "physiotherapy"],                          default: "none" }
        ]
      }
    ]
  },

  "/ccsciatica": {
    title: "CC Sciatica",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "normal",
    mainLabels: [
      {
        name: "CC Sciatica",
        noHeader: true,
        subLabels: [
          { label: "Low back pain with leg radiation for", type: "prefix", width: "full", default: "2 weeks" },
          { label: "VAS",                                  type: "text",   width: "half", default: "/10" }
        ]
      }
    ]
  },

  "/ccpostop": {
    title: "CC Post-Op Follow Up",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "normal",
    mainLabels: [
      {
        name: "CC PostOp",
        noHeader: true,
        subLabels: [
          { label: "Post-operative follow-up", type: "prefix", width: "half", default: "" },
          { label: "Done on",                  type: "text",   width: "half", default: "" },
          { label: "VAS",                      type: "text",   width: "half", default: "/10" }
        ]
      }
    ]
  },

  "/ccknee": {
    title: "CC Knee Pain",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "CC Knee",
        noHeader: true,
        subLabels: [
          { label: "Knee pain for",    type: "prefix", width: "half", default: "1 month" },
          { label: "VAS",              type: "text",   width: "half", default: "/10" },
          { label: "Mechanism",        type: "select", width: "half", options: ["degenerative", "trauma", "insidious"],    default: "degenerative" },
          { label: "Swelling",         type: "select", width: "half", options: ["no", "yes"],                              default: "no" },
          { label: "Locking/Catching", type: "select", width: "half", options: ["no", "yes"],                              default: "no" },
          { label: "Instability",      type: "select", width: "half", options: ["no", "yes"],                              default: "no" },
          { label: "Previous injury",  type: "select", width: "full", options: ["none", "specify"],                        default: "none" }
        ]
      }
    ]
  },

  "/ccshoulder": {
    title: "CC Shoulder Pain",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "normal",
    mainLabels: [
      {
        name: "CC Shoulder",
        noHeader: true,
        subLabels: [
          { label: "Shoulder pain for", type: "prefix", width: "half", default: "2 weeks" },
          { label: "VAS",               type: "text",   width: "half", default: "/10" }
        ]
      }
    ]
  },

  "/cctrauma": {
    title: "CC Post Trauma",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "normal",
    mainLabels: [
      {
        name: "CC Trauma",
        noHeader: true,
        subLabels: [
          { label: "Post-trauma", type: "prefix", width: "half", default: "lower back" },
          { label: "VAS",         type: "text",   width: "half", default: "/10" }
        ]
      }
    ]
  },

  "/ccfollowup": {
    title: "Orthopedic Follow-Up Note",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "normal",
    mainLabels: [
      {
        name: "Follow-Up",
        noHeader: true,
        subLabels: [
          { label: "Follow up case of",     type: "text", width: "full", default: "" },
          { label: "Pain Score (VAS 0-10)", type: "text", width: "half", default: "" },
          { label: "What Has Improved",     type: "text", width: "full", default: "" },
          { label: "What Has Not Improved", type: "text", width: "full", default: "" }
        ]
      }
    ]
  },

  "/ccarthritis": {
    title: "Polyarthritis Assessment",
    icon: "",
    category: "chief-complaint",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "POLYARTHRITIS",
        noHeader: true,
        subLabels: [
          { label: "Distribution",    type: "select", width: "half", options: ["Small joint symmetric", "Large joint", "Axial", "Mixed"],            default: "Small joint symmetric" },
          { label: "Stiffness (min)", type: "text",   width: "half", default: "" },
          { label: "Swelling",        type: "select", width: "half", options: ["Yes", "No"],                                                         default: "Yes" },
          { label: "Red flags",       type: "select", width: "half", options: ["None", "Fever", "Rash", "Eyes", "GI", "Psoriasis"],                  default: "None" },
          { label: "IMPRESSION",      type: "select", width: "half", options: ["Inflammatory RA", "Gout", "SLE", "OA", "Other"],                    default: "Inflammatory RA" },
          { label: "PLAN",            type: "select", width: "full", options: ["Start MTX", "Indomethacin", "Refer Rheum", "NSAIDs", "Conservative"],default: "Start MTX" }
        ]
      }
    ]
  },

  // 
  //  HMH-OPD-CLINICAL DETAIL
  // 

  "/lbpdetails": {
    title: "LBP Detail",
    icon: "",
    category: "clinical-detail",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "LBP Details",
        noHeader: true,
        subLabels: [
          { label: "Duration",           type: "text",   width: "half", default: "" },
          { label: "Onset",              type: "select", width: "half", options: ["acute", "gradual"],                                          default: "acute" },
          { label: "Radiation",          type: "select", width: "half", options: ["none", "buttock", "left leg", "right leg", "bilateral"],     default: "none" },
          { label: "Aggravating",        type: "select", width: "half", options: ["bending", "lifting", "prolonged sitting", "walking"],        default: "bending" },
          { label: "Night pain",         type: "select", width: "half", options: ["no", "yes"],                                                 default: "no" },
          { label: "Red flags",          type: "select", width: "half", options: ["none", "bladder dysfunction", "bowel dysfunction"],          default: "none" },
          { label: "Previous treatment", type: "select", width: "full", options: ["none", "analgesics", "physiotherapy"],                       default: "none" }
        ]
      }
    ]
  },

  "/cervicaldetails": {
    title: "Cervical Detail",
    icon: "",
    category: "clinical-detail",
    layout: "single",
    popupWidth: "normal",
    mainLabels: [
      {
        name: "Cervical Details",
        noHeader: true,
        subLabels: [
          { label: "Duration",              type: "text",   width: "half", default: "" },
          { label: "Radiation",             type: "select", width: "half", options: ["none", "left arm", "right arm", "bilateral arms"],           default: "none" },
          { label: "Mechanism",             type: "select", width: "half", options: ["degenerative", "post-trauma"],                               default: "degenerative" },
          { label: "Neurological symptoms", type: "select", width: "half", options: ["none", "numbness", "weakness", "both"],                     default: "none" },
          { label: "Red flags",             type: "select", width: "full", options: ["none", "myelopathy signs present"],                         default: "none" }
        ]
      }
    ]
  },

  "/kneedetails": {
    title: "Knee Details",
    icon: "",
    category: "clinical-detail",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Knee Details",
        noHeader: true,
        subLabels: [
          { label: "Duration",               type: "text",   width: "half", default: "" },
          { label: "Side",                   type: "select", width: "half", options: ["right", "left", "bilateral"],                                  default: "right" },
          { label: "Mechanism",              type: "select", width: "half", options: ["degenerative", "trauma", "insidious", "sports injury"],        default: "degenerative" },
          { label: "Swelling",               type: "select", width: "half", options: ["no", "yes", "intermittent"],                                  default: "no" },
          { label: "Locking/Catching",       type: "select", width: "half", options: ["no", "yes"],                                                  default: "no" },
          { label: "Instability",            type: "select", width: "half", options: ["no", "yes"],                                                  default: "no" },
          { label: "Morning stiffness",      type: "select", width: "half", options: ["no", "yes", "<30 min", ">30 min"],                            default: "no" },
          { label: "Difficulty with stairs", type: "select", width: "half", options: ["no", "yes"],                                                  default: "no" },
          { label: "Previous injury/surgery",type: "select", width: "full", options: ["none", "specify"],                                            default: "none" }
        ]
      }
    ]
  },

  "/arthritisdetail": {
    title: "Arthritis Detail",
    icon: "",
    category: "clinical-detail",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Arthritis Details",
        noHeader: true,
        subLabels: [
          { label: "Joints involved",    type: "text",   width: "full", default: "" },
          { label: "Duration",           type: "text",   width: "half", default: "" },
          { label: "Pattern",            type: "select", width: "half", options: ["symmetric", "asymmetric", "migratory", "additive"],           default: "symmetric" },
          { label: "Morning stiffness",  type: "select", width: "half", options: ["none", "<30 min", ">30 min", ">1 hour"],                     default: "none" },
          { label: "Joint swelling",     type: "select", width: "half", options: ["no", "yes"],                                                 default: "no" },
          { label: "Deformity",          type: "select", width: "half", options: ["none", "present"],                                          default: "none" },
          { label: "Systemic symptoms",  type: "select", width: "half", options: ["none", "fever", "weight loss", "fatigue", "rash"],           default: "none" },
          { label: "Family history",     type: "select", width: "full", options: ["none", "RA", "SLE", "gout", "psoriasis"],                   default: "none" }
        ]
      }
    ]
  },

  "/arthritis_assessment": {
    title: "Arthritis Assessment",
    icon: "",
    category: "clinical-detail",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Arthritis Assessment",
        noHeader: true,
        subLabels: [
          { label: "Type",              type: "select", width: "half", options: ["Inflammatory", "Degenerative", "Crystal", "Reactive", "Psoriatic"],default: "Inflammatory" },
          { label: "Disease activity",  type: "select", width: "half", options: ["Low", "Moderate", "High", "Remission"],                          default: "Moderate" },
          { label: "DAS28 Score",       type: "text",   width: "half", default: "" },
          { label: "Tender joints",     type: "text",   width: "half", default: "" },
          { label: "Swollen joints",    type: "text",   width: "half", default: "" },
          { label: "ESR/CRP",           type: "text",   width: "half", default: "" },
          { label: "Functional status", type: "select", width: "half", options: ["Class I", "Class II", "Class III", "Class IV"],                  default: "Class I" },
          { label: "Plan",              type: "select", width: "full", options: ["Continue current", "Start DMARD", "Modify DMARD", "Add biologic", "Refer rheumatology"],default: "Continue current" }
        ]
      }
    ]
  },

  // 
  //  HMH-OPD-EXAM  (Examinations)
  // 

  "/oeeblow": {
    title: "Elbow Examination",
    icon: "",
    category: "examination",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Elbow Exam",
        noHeader: true,
        subLabels: [
          { label: "Side",          type: "select", width: "half", options: ["right", "left", "bilateral"],                                                        default: "right" },
          { label: "Swelling",      type: "select", width: "half", options: ["none", "yes"],                                                                       default: "none" },
          { label: "Tenderness",    type: "select", width: "half", options: ["none", "lateral epicondyle", "medial epicondyle", "olecranon", "diffuse"],            default: "none" },
          { label: "ROM",           type: "select", width: "half", options: ["full", "limited flexion", "limited extension", "limited rotation"],                  default: "full" },
          { label: "Stability",     type: "select", width: "half", options: ["stable", "valgus stress positive", "varus stress positive"],                         default: "stable" },
          { label: "Special tests", type: "select", width: "half", options: ["none", "Cozen s +ve", "Mill s +ve", "reverse Cozen s +ve"],                          default: "none" }
        ]
      }
    ]
  },

  "/oespine": {
    title: "Spine Examination",
    icon: "",
    category: "examination",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Spine Exam",
        noHeader: true,
        subLabels: [
          { label: "Region",           type: "select", width: "half", options: ["cervical", "thoracic", "lumbar", "sacral"],                                                  default: "lumbar" },
          { label: "Posture",          type: "select", width: "half", options: ["normal", "loss of lordosis", "kyphosis", "scoliosis", "antalgic"],                           default: "normal" },
          { label: "Tenderness",       type: "select", width: "half", options: ["none", "midline", "paraspinal", "diffuse"],                                                  default: "none" },
          { label: "Paraspinal spasm", type: "select", width: "half", options: ["no", "yes"],                                                                                default: "no" },
          { label: "ROM",              type: "select", width: "half", options: ["full", "limited flexion", "limited extension", "limited lateral bending", "limited rotation"],default: "full" },
          { label: "SLR",              type: "select", width: "half", options: ["negative", "positive right", "positive left", "positive bilateral"],                        default: "negative" },
          { label: "Neurological",     type: "select", width: "half", options: ["intact", "motor deficit", "sensory deficit", "reflex changes"],                             default: "intact" },
          { label: "Gait",             type: "select", width: "half", options: ["normal", "antalgic", "trendelenburg"],                                                      default: "normal" }
        ]
      }
    ]
  },

  "/oeknee": {
    title: "Knee Examination",
    icon: "",
    category: "examination",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Knee Exam",
        noHeader: true,
        subLabels: [
          { label: "Side",              type: "select", width: "half", options: ["right", "left", "bilateral"],                                                              default: "right" },
          { label: "Effusion",          type: "select", width: "half", options: ["none", "mild", "moderate", "tense"],                                                       default: "none" },
          { label: "Tenderness",        type: "select", width: "half", options: ["none", "medial joint line", "lateral joint line", "patellofemoral", "diffuse"],            default: "none" },
          { label: "ROM",               type: "select", width: "half", options: ["full", "limited flexion", "limited extension", "flexion contracture"],                     default: "full" },
          { label: "ACL",               type: "select", width: "half", options: ["intact", "lax", "positive Lachman", "positive drawer"],                                   default: "intact" },
          { label: "MCL/LCL",           type: "select", width: "half", options: ["stable", "MCL lax", "LCL lax"],                                                           default: "stable" },
          { label: "Meniscus",          type: "select", width: "half", options: ["negative", "positive medial", "positive lateral"],                                        default: "negative" },
          { label: "Patella tracking",  type: "select", width: "half", options: ["normal", "J-sign", "apprehension +ve", "grind +ve"],                                      default: "normal" }
        ]
      }
    ]
  },

  "/oeshoulder": {
    title: "Shoulder Examination",
    icon: "",
    category: "examination",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Shoulder Exam",
        noHeader: true,
        subLabels: [
          { label: "Side",           type: "select", width: "half", options: ["right", "left", "bilateral"],                                                                     default: "right" },
          { label: "Wasting",        type: "select", width: "half", options: ["none", "deltoid", "supraspinatus", "infraspinatus"],                                              default: "none" },
          { label: "Tenderness",     type: "select", width: "half", options: ["none", "AC joint", "subacromial", "bicipital groove", "diffuse"],                                 default: "none" },
          { label: "Active ROM",     type: "select", width: "half", options: ["full", "limited abduction", "limited forward flexion", "limited external rotation", "limited internal rotation"],default: "full" },
          { label: "Impingement",    type: "select", width: "half", options: ["negative", "Neer +ve", "Hawkins +ve", "both positive"],                                          default: "negative" },
          { label: "Rotator cuff",   type: "select", width: "half", options: ["intact", "supraspinatus weakness", "drop arm +ve", "external rotation lag"],                     default: "intact" },
          { label: "Instability",    type: "select", width: "half", options: ["stable", "anterior apprehension +ve", "posterior apprehension +ve", "sulcus sign +ve"],          default: "stable" },
          { label: "Special tests",  type: "select", width: "half", options: ["none", "Speed s +ve", "Yergason s +ve", "O Brien s +ve", "cross body +ve"],                      default: "none" }
        ]
      }
    ]
  },

  "/oeankle": {
    title: "Ankle Examination",
    icon: "",
    category: "examination",
    layout: "single",
    popupWidth: "wide",
    mainLabels: [
      {
        name: "Ankle Exam",
        noHeader: true,
        subLabels: [
          { label: "Side",          type: "select", width: "half", options: ["right", "left", "bilateral"],                                                              default: "right" },
          { label: "Swelling",      type: "select", width: "half", options: ["none", "lateral", "medial", "diffuse"],                                                   default: "none" },
          { label: "Tenderness",    type: "select", width: "half", options: ["none", "lateral malleolus", "medial malleolus", "ATFL", "achilles", "base of 5th MT"],    default: "none" },
          { label: "ROM",           type: "select", width: "half", options: ["full", "limited dorsiflexion", "limited plantarflexion", "limited inversion", "limited eversion"],default: "full" },
          { label: "Stability",     type: "select", width: "half", options: ["stable", "anterior drawer +ve", "talar tilt +ve"],                                        default: "stable" },
          { label: "Thompson test", type: "select", width: "half", options: ["negative", "positive"],                                                                   default: "negative" }
        ]
      }
    ]
  }

};

// Make available to content.js (same content-script context)
if (typeof window !== 'undefined') {
  window.VINAVI_BUILTIN_TEMPLATES = VINAVI_BUILTIN_TEMPLATES;
}