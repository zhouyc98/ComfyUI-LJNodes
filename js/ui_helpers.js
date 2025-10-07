import { app } from "../../../scripts/app.js";
import { clickedOnGroupTitle, 
  addNodesToGroup,
  getOutputNodesFromSelected,
  defaultGetSlotMenuOptions,
         distributeNodesEvenly
} from "./utils.js";

const LJNODES_NODE_TITLE_EDIT_TRIGGER = "Comfy.LJNodes.UIHelpers.NodeTitleEditTrigger";
const LJNODES_NODE_TITLE_EDIT_TRIGGER_DEFAULT = "Double Click";
const LJNODES_GROUP_PADDING = "Comfy.LJNodes.UIHelpers.GroupPadding";
const LJNODES_GROUP_PADDING_DEFAULT = 10;

app.registerExtension({
  name: "Comfy.LJNodes.UIHelpers",

  async nodeCreated(node, app) {
    node.getSlotMenuOptions = getSlotMenuOptions;
  },
});

function getSlotMenuOptions(slot) {
  let options = defaultGetSlotMenuOptions(slot);

  if (slot.output?.links?.length) {
    options.push({
      content: "Add Reroute in between",
      callback: () => {
        // create a reroute node
        let reroute = LiteGraph.createNode("Reroute");
        reroute.pos = [this.pos[0] + this.size[0] + 24, this.pos[1]];
        app.graph.add(reroute, false);
        // copy the connections to the reroute node
        let links = [...slot.output.links];
        for (let i in links) {
            let link = app.graph.links[links[i]];
            let target_node = app.graph.getNodeById(link.target_id);
            reroute.connect(0, target_node, link.target_slot);
        }
        // disconnect the original node
        this.disconnectOutput(slot.slot);
        // connect to the new reroute node
        this.connect(slot.slot, reroute, 0);
        app.graph.afterChange();
      },
    });
  }
  return options;
}
