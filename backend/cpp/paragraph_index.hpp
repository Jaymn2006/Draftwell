#pragma once

#include <string>
#include <vector>
#include <cstdint>
#include <cstddef>

namespace draftwell {

struct ParagraphSpan {
    std::size_t start_offset;
    std::size_t end_offset;
    std::size_t index;
};

class ParagraphIndexer {
public:
    explicit ParagraphIndexer(const std::string& content);

    const std::vector<ParagraphSpan>& spans() const noexcept { return spans_; }
    std::size_t count() const noexcept { return spans_.size(); }

    int paragraph_at_offset(std::size_t offset) const noexcept;

    std::uint64_t content_hash() const noexcept { return hash_; }

private:
    std::vector<ParagraphSpan> spans_;
    std::uint64_t hash_;
};

}  // namespace draftwell
