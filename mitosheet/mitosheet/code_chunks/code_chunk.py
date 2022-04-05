


from typing import TYPE_CHECKING, Any, Dict, List, Optional

if TYPE_CHECKING:
    from mitosheet.state import State
else:
    State = Any

class CodeChunk:

    def __init__(self, 
        prev_state: State,
        post_state: State,
        params: Dict[str, Any], 
        execution_data: Optional[Dict[str, Any]]
    ):
        self.prev_state = prev_state
        self.post_state = post_state
        self.params = params
        self.execution_data = execution_data

    def get_param(self, key) -> Optional[Any]:
        if key in self.params:
            return self.params[key]
        return None

    def get_execution_data(self, key) -> Optional[Any]:
        if self.execution_data and key in self.execution_data:
            return self.execution_data[key]
        return None

    def params_match(self, other_code_chunk: "CodeChunk", param_keys: List[str]) -> bool:
        for key in param_keys:
            if self.get_param(key) != other_code_chunk.get_param(key):
                return False
        return True
    
    def combine_right(self, other_code_chunk) -> Optional["CodeChunk"]:
        return None

    def transpile(self) -> List[str]:
        raise NotImplementedError('Implement in subclass')